const axios = require('axios');
function formatScheduleMessage(data, type) {
    if (!data || !data.length) {
        return 'Расписание не найдено или ошибка в данных.\nОбычно такое происходит при технических работах\nПопробуйте позже.';
    }

    const daysOfWeek = {
        'MONDAY': 'Понедельник',
        'TUESDAY': 'Вторник',
        'WEDNESDAY': 'Среда',
        'THURSDAY': 'Четверг',
        'FRIDAY': 'Пятница',
        'SATURDAY': 'Суббота',
        'SUNDAY': 'Воскресенье'
    };

    const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const today = new Date();
    const currentDay = today.getDay();

    let daysToShow;

    const requestDate = getRequestDate(today, currentDay);

    const replacementResponse =  checkReplacementExist(requestDate);

    if (!replacementResponse.status) {
        daysToShow = getReducedDaysToShow(currentDay);
    } else {
        daysToShow = getExtendedDaysToShow(currentDay);
    }
    console.log(requestDate)

    const groupedSchedule = data.reduce((acc, item) => {
        const day = item.dayOfWeek;
        if (daysToShow.includes(day)) {
            if (!acc[day]) {
                acc[day] = [];
            }
            acc[day].push(item);
        }
        return acc;
    }, {});
    console.log(groupedSchedule)

    let scheduleMessage = '';

    daysOrder.forEach(day => {
        if (groupedSchedule[day]) {
            groupedSchedule[day].sort((a, b) => a.ordinal - b.ordinal);

            const dayDate = getNextDayDate(today, day);

            if(type === 'teacher'){
                scheduleMessage += `Расписание для преподавателя ${groupedSchedule[day][0].teacher} \n${daysOfWeek[day]} ${dayDate.toLocaleDateString('ru-RU')}:\n`;
            }
            else if(type === 'classrooms'){
                scheduleMessage += `Расписание для кабинета ${groupedSchedule[day][0].location} \n${daysOfWeek[day]} ${dayDate.toLocaleDateString('ru-RU')}:\n`;
            }
            else {
                scheduleMessage += `Расписание для группы ${groupedSchedule[day][0].group.title} \n${daysOfWeek[day]} ${dayDate.toLocaleDateString('ru-RU')}:\n`;
            }

            groupedSchedule[day].forEach((lesson) => {
                const ordinalEmoji = getOrdinalEmoji(lesson.ordinal);
                let lessonMessage = '';

                if (lesson.subject === '------------') {
                    lessonMessage = `${ordinalEmoji} ❌ Пара отменена`;
                }
                else if (lesson.subject.includes('(Сам.раб)')) {
                    lessonMessage = `${ordinalEmoji} ${lesson.subject}`;
                } else {
                    lessonMessage = `${ordinalEmoji}`;

                    const isPencilReplacement = lesson.isReplacement === true;
                    if (isPencilReplacement) {
                        lessonMessage += ' ✏️';
                    }

                    lessonMessage += ` ${lesson.subject}`;
                    lessonMessage += ` 🎓${lesson.teacher} 🚪${lesson.location}`;

                    if (type === 'teacher' || type === 'classrooms') {
                        lessonMessage += ` - ${lesson.group.title}`;
                        if (lesson.subgroup !== 0) {
                            lessonMessage += ` (${lesson.subgroup})`;
                        }
                    }

                    lessonMessage += ` ${getOrdinalTime(lesson.ordinal)}`;
                }

                scheduleMessage += lessonMessage + '\n';
            });

            scheduleMessage += '\n';
        }
    });

    return scheduleMessage;
}

async function checkReplacementExist(date) {
    try {
        const response = await axios.get(`${process.env.HOST}/replacementexist`, {
            params: { date }
        });
        return response.data;
    } catch (error) {
        return { status: false };
    }
}

function getRequestDate(today, currentDay) {
    const daysMap = {
        1: 'THURSDAY',
        2: 'THURSDAY',
        3: 'THURSDAY',
        4: 'MONDAY',
        5: 'MONDAY',
        6: 'MONDAY',
        0: 'MONDAY',
    };

    let requestedDay = daysMap[currentDay];
    const requestedDate = getNextDayDate(today, requestedDay);
    return requestedDate.toISOString().split('T')[0];
}
function getExtendedDaysToShow(currentDay) {
    switch (currentDay) {
        case 1:
            return ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        case 2:
            return ['WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        case 4:
            return ['THURSDAY', 'FRIDAY', 'SATURDAY'];
        case 5:
            return ['FRIDAY', 'SATURDAY'];
        default:
            return [];
    }
}

function getReducedDaysToShow(currentDay) {
    switch (currentDay) {
        case 1:
            return ['MONDAY', 'TUESDAY', 'WEDNESDAY'];
        case 2:
            return ['TUESDAY', 'WEDNESDAY'];
        case 3:
            return ['WEDNESDAY'];
        case 4:
            return ['THURSDAY', 'FRIDAY', 'SATURDAY'];
        case 5:
            return ['FRIDAY', 'SATURDAY'];
        case 6:
            return ['SATURDAY'];
        default:
            return [];
    }
}

function getOrdinalEmoji(ordinal) {
    const emojiMap = {
        1: '1️⃣',
        2: '2️⃣',
        3: '3️⃣',
        4: '4️⃣',
        5: '5️⃣',
        6: '6️⃣',
        7: '7️⃣',
        8: '8️⃣'
    };

    return emojiMap[ordinal] || `${ordinal}️⃣`;
}

function getOrdinalTime(ordinal) {
    const TimeMap = {
        1: '🕣08:30-10:00',
        2: '🕙10:10-11:40',
        3: '🕧12:20-13:50',
        4: '🕝14:20-15:50',
        5: '🕓16:00-17:30',
        6: '🕠17:40-19:10',
        7: '🕢19:20-20:50',
    };

    return TimeMap[ordinal];
}

function getNextDayDate(today, day) {
    const daysMap = {
        'MONDAY': 1,
        'TUESDAY': 2,
        'WEDNESDAY': 3,
        'THURSDAY': 4,
        'FRIDAY': 5,
        'SATURDAY': 6,
        'SUNDAY': 0
    };
    const daysUntilNext = (daysMap[day] + 7 - today.getDay()) % 7;
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + daysUntilNext);
    return nextDay;
}

module.exports = { formatScheduleMessage };
