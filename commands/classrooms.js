const axios = require('axios');
const { createBackButtonKeyboard, createKeyboard } = require('../utility/button');
const { formatScheduleMessage } = require('../utility/scheduleFormatter');
const mergeSchedules = require('../utility/scheduleMerger');
require('dotenv').config();
const dotenv = require('dotenv');
dotenv.config();

module.exports.execute = async (context, userStates) => {
    userStates.set(context.peerId, { state: 'awaiting_location_number' });

    await context.send({
        message: 'Введите номер кабинета, пример: А407',
        keyboard: JSON.stringify(createBackButtonKeyboard())
    });
};

module.exports.handleMessage = async (context, userStates) => {
    if (context.text === 'Назад') {
        userStates.delete(context.peerId);
        await context.send({
            message: 'Вы вернулись в главное меню. Выберите команду.',
            keyboard: JSON.stringify(createKeyboard())
        });
        return true;
    }

    const userId = context.peerId;
    const state = userStates.get(userId);

    let week_type;

    var year = new Date().getFullYear();
    var month = new Date().getMonth();
    var today = new Date(year, month, 0).getTime();
    var now = new Date().getTime();
    var DayOfWeek = new Date().getDay()
    var week = Math.ceil((now - today) / (1000 * 60 * 60 * 24 * 7));
    if ((week % 2 ) == 0) {
        week_type = 2;
    } else {
        week_type = 1;
    }

    if (state && state.state === 'awaiting_location_number') {
        const locationNumber = context.text.trim();

        userStates.set(userId, { state: 'awaiting_schedule_for_location' });

        if (DayOfWeek === 6) {

            let SaturdayResponse = await axios.get(`${process.env.HOST}/locations/${encodeURIComponent(locationNumber)}/lessons`, {
                params: { odd: week_type }
        });

            let saturdayReplacementResponse =  await axios.get(`${process.env.HOST}/locations/${encodeURIComponent(locationNumber)}/replacements`);

            const SaturdayReplacementResponse = saturdayReplacementResponse.data.filter(replacement => replacement.datOfWeek === "SATURDAY");
            const SaturdayLessons = SaturdayResponse.data.filter(lesson => lesson.dayOfWeek === "SATURDAY");

            const saturdaySchedule = mergeSchedules(SaturdayLessons, SaturdayReplacementResponse);

            if ((week % 2 ) == 0) {
                week_type = 1;
            } else {
                week_type = 2;
            }

            const lessonsResponse = await axios.get(`${process.env.HOST}/locations/${encodeURIComponent(locationNumber)}/lessons`, {
                params: { odd: week_type }
            });

            const replacementResponse = await axios.get(`${process.env.HOST}/locations/${encodeURIComponent(locationNumber)}/replacements`);


            let updatedSchedule = mergeSchedules(lessonsResponse.data, replacementResponse.data);

            updatedSchedule = updatedSchedule.filter(lesson => lesson.dayOfWeek !== "SATURDAY");

            const finalSchedule = [...updatedSchedule, ...saturdaySchedule];
            const scheduleMessage = formatScheduleMessage(finalSchedule, true);

            await context.send({
                message: scheduleMessage,
                keyboard: JSON.stringify(createKeyboard())
            });
        }
        else{
            const lessonsResponse = await axios.get(`${process.env.HOST}/locations/${encodeURIComponent(locationNumber)}/lessons`, {
                params: { odd: week_type }
            });

            const replacementsResponse = await axios.get(`${process.env.HOST}/locations/${encodeURIComponent(locationNumber)}/replacements`);

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
                await context.send('Не найдено расписание или замены для этого кабинета. \nОбычно такое происходит при технических работах\nПопробуйте позже.');
            }

            userStates.delete(userId);
        }
    }
};
