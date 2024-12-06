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
    for (const [day, lessons] of Object.entries(groupedSchedule)) {
        scheduleMessage += `${daysOfWeek[day]}\n`;

        lessons.forEach((lesson) => {
            const ordinalEmoji = getOrdinalEmoji(lesson.ordinal);
            let lessonMessage = `${ordinalEmoji} ${lesson.subject} 🎓${lesson.teacher} 🚪${lesson.location} `;

            if (includeGroup) {
                lessonMessage += `- ${lesson.group.title}`;
            }

            scheduleMessage += lessonMessage + '\n';
        });

        scheduleMessage += '\n';
    }

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
            return ['WEDNESDAY'];
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

module.exports = { formatScheduleMessage };
