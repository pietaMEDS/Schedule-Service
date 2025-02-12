function formatScheduleMessage(data, includeGroup = false) {
    if (!data || !data.length) {
        return 'Расписание не найдено или ошибка в данных.';
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

    let daysToShow = getDaysToShow(currentDay);

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

    let scheduleMessage = '';

    if (currentDay === 6) {
        const reorderedDays = ['SATURDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY'];
        const otherDays = ['THURSDAY', 'FRIDAY'];

        daysOrder.length = 0;
        daysOrder.push(...reorderedDays, ...otherDays);
    }

    daysOrder.forEach(day => {
        if (groupedSchedule[day]) {
            groupedSchedule[day].sort((a, b) => a.ordinal - b.ordinal);
            scheduleMessage += `${daysOfWeek[day]}\n`;

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

                    if (includeGroup) {
                        lessonMessage += ` - ${lesson.group.title}`;
                        if (lesson.subgroup !== 0) {
                            lessonMessage += ` (${lesson.subgroup})`;
                        }
                    } 
                    lessonMessage += ` ${getOrdinalTime(lesson.ordinal)} `;
                }

                scheduleMessage += lessonMessage + '\n';
            });

            scheduleMessage += '\n';
        }
    });

    return scheduleMessage;
}

function getDaysToShow(currentDay) {
    switch (currentDay) {
        case 0:
            return ['MONDAY', 'TUESDAY', 'WEDNESDAY'];
        case 1:
            return ['MONDAY', 'TUESDAY', 'WEDNESDAY'];
        case 2:
            return ['TUESDAY', 'WEDNESDAY'];
        case 3:
            return ['WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        case 4:
            return ['THURSDAY', 'FRIDAY', 'SATURDAY'];
        case 5:
            return ['FRIDAY', 'SATURDAY'];
        case 6:
            return ['SATURDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY'];
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
        1: '🕣 08:30-10:00',
        2: '🕙 10:10-11:40',
        3: '🕧 12:20-13:50',
        4: '🕝 14:20-15:50',
        5: '🕓 16:00-17:30',
        6: '🕠 17:40-19:10',
        7: '🕢 19:20-20:50',
    };

    return TimeMap[ordinal];
}

module.exports = { formatScheduleMessage };
