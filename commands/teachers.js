const axios = require('axios');
const { createBackButtonKeyboard, createKeyboard } = require('../utility/button');
const { formatScheduleMessage } = require('../utility/scheduleFormatter');
const mergeSchedules = require('../utility/scheduleMerger');

module.exports.execute = async (context, userStates) => {
    userStates.set(context.peerId, { state: 'awaiting_teacher_name' });

    await context.send({
        message: 'Введите фамилию преподавателя:',
        keyboard: JSON.stringify(createBackButtonKeyboard())
    });
};

module.exports.handleMessage = async (context, userStates) => {
    const userId = context.peerId;
    const state = userStates.get(userId);

    let week_type;

    var year = new Date().getFullYear();
    var month = new Date().getMonth();
    var today = new Date(year, month, 0).getTime();
    var now = new Date().getTime();
    var week = Math.ceil((now - today) / (1000 * 60 * 60 * 24 * 7));
    if (week % 2) {
        week_type = 1;
    } else {
        week_type = 2;
    }

    if (state && state.state === 'awaiting_teacher_name') {
        const teacherName = context.text.trim();

        userStates.set(userId, { state: 'awaiting_schedule' });

        try {
            const lessonsResponse = await axios.get('http://localhost:9000/api/teachers/' + encodeURIComponent(teacherName) + '/lessons', {
                params: { odd: week_type }
            });

            const replacementsResponse = await axios.get('http://localhost:9000/api/teachers/' + encodeURIComponent(teacherName) + '/replacements');

            const lessons = lessonsResponse.data;
            const replacements = replacementsResponse.data;


            const updatedSchedule = mergeSchedules(lessons, replacements);
            console.log(updatedSchedule);

            if (updatedSchedule && updatedSchedule.length > 0) {
                const scheduleMessage = formatScheduleMessage(updatedSchedule, true);

                await context.send({
                    message: scheduleMessage,
                    keyboard: JSON.stringify(createKeyboard())
                });
            } else {
                await context.send('Не найдено расписание или замены для этого учителя.');
            }
        } catch (error) {
            console.error('Ошибка при запросе к API:', error);
            await context.send('Произошла ошибка при запросе к серверу. Попробуйте снова позже.');
        }

        userStates.delete(userId);
    }
};
