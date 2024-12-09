const axios = require('axios');
const { createBackButtonKeyboard, createKeyboard } = require('../utility/button');
const { formatScheduleMessage } = require('../utility/scheduleFormatter');
const mergeSchedules = require('../utility/scheduleMerger');

module.exports.execute = async (context, userStates) => {
    userStates.set(context.peerId, { state: 'awaiting_location_number' });

    await context.send({
        message: 'Введите номер кабинета:',
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

    if (state && state.state === 'awaiting_location_number') {
        const locationNumber = context.text.trim();

        userStates.set(userId, { state: 'awaiting_schedule_for_location' });

        try {
            const lessonsResponse = await axios.get(`http://localhost:9000/api/locations/${encodeURIComponent(locationNumber)}/lessons`, {
                params: { odd: week_type }
            });

            const replacementsResponse = await axios.get(`http://localhost:9000/api/locations/${encodeURIComponent(locationNumber)}/replacements`);

            const lessons = lessonsResponse.data;
            const replacements = replacementsResponse.data;

            const updatedSchedule = mergeSchedules(lessons, replacements);

            if (updatedSchedule && updatedSchedule.length > 0) {
                const scheduleMessage = formatScheduleMessage(updatedSchedule, false);

                await context.send({
                    message: scheduleMessage,
                    keyboard: JSON.stringify(createKeyboard())
                });
            } else {
                await context.send('Не найдено расписание или замены для этого кабинета.');
            }
        } catch (error) {
            console.error('Ошибка при запросе к API:', error);
            await context.send('Произошла ошибка при запросе к серверу. Попробуйте снова позже.');
        }

        userStates.delete(userId);
    }
};
