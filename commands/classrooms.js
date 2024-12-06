const axios = require('axios');
const { createBackButtonKeyboard, createKeyboard } = require('../utility/button');
const { formatScheduleMessage } = require('../utility/scheduleFormatter');
const mergeSchedules = require('../utility/scheduleMerger');

module.exports.execute = async (context, userStates) => {
    // Запрашиваем номер кабинета
    userStates.set(context.peerId, { state: 'awaiting_location_number' });

    await context.send({
        message: 'Введите номер кабинета:',
        keyboard: JSON.stringify(createBackButtonKeyboard())
    });
};

module.exports.handleMessage = async (context, userStates) => {
    const userId = context.peerId;
    const state = userStates.get(userId);

    // Если пользователь ожидает номер кабинета
    if (state && state.state === 'awaiting_location_number') {
        const locationNumber = context.text.trim();

        // Устанавливаем состояние, что ожидаем расписание
        userStates.set(userId, { state: 'awaiting_schedule_for_location' });

        try {
            // Запрос к расписанию для указанного кабинета
            const lessonsResponse = await axios.get(`http://localhost:9000/api/locations/${encodeURIComponent(locationNumber)}/lessons`);

            // Запрос к заменам для указанного кабинета
            const replacementsResponse = await axios.get(`http://localhost:9000/api/locations/${encodeURIComponent(locationNumber)}/replacements`);

            const lessons = lessonsResponse.data;
            const replacements = replacementsResponse.data;
            console.log(lessons);

            // Объединяем расписание и замены
            const updatedSchedule = mergeSchedules(lessons, replacements);

            if (updatedSchedule && updatedSchedule.length > 0) {
                // Форматируем расписание
                const scheduleMessage = formatScheduleMessage(updatedSchedule, false);

                // Отправляем расписание пользователю
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

        // Сбрасываем состояние после обработки
        userStates.delete(userId);
    }
};
