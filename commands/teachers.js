const axios = require('axios');
const { createBackButtonKeyboard, createKeyboard } = require('../utility/button');
const { formatScheduleMessage } = require('../utility/scheduleFormatter');
const mergeSchedules = require('../utility/scheduleMerger');
require('dotenv').config();
const dotenv = require('dotenv');
dotenv.config();

module.exports.execute = async (context, userStates) => {
    userStates.set(context.peerId, { state: 'awaiting_teacher_name' });

    await context.send({
        message: 'Введите фамилию преподавателя:',
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
    if (week % 2) {
        week_type = 2;
    } else {
        week_type = 1;
    }

    if (state && state.state === 'awaiting_teacher_name') {
        const teacherName = context.text.trim();

        userStates.set(userId, { state: 'awaiting_schedule' });

        if (DayOfWeek === 6) {

            let SaturdayResponse = await axios.get(`${process.env.HOST}/teachers/` + encodeURIComponent(teacherName) + '/lessons', {
                params: { odd: week_type }
            });

            let saturdayReplacementResponse =  await axios.get(`${process.env.HOST}/teachers/` + encodeURIComponent(teacherName) + '/replacements');

            const SaturdayReplacementResponse = saturdayReplacementResponse.data.filter(replacement => replacement.datOfWeek === "SATURDAY");
            const SaturdayLessons = SaturdayResponse.data.filter(lesson => lesson.dayOfWeek === "SATURDAY");

            const saturdaySchedule = mergeSchedules(SaturdayLessons, SaturdayReplacementResponse);

            if (week % 2) {
                week_type = 1;
            } else {
                week_type = 2;
            }

            const lessonsResponse = await axios.get(`${process.env.HOST}/teachers/` + encodeURIComponent(teacherName) + '/lessons', {
                params: { odd: week_type }
            });

            const replacementResponse = await axios.get(`${process.env.HOST}/teachers/` + encodeURIComponent(teacherName) + '/replacements');


            let updatedSchedule = mergeSchedules(lessonsResponse.data, replacementResponse.data);

            updatedSchedule = updatedSchedule.filter(lesson => lesson.dayOfWeek !== "SATURDAY");

            const finalSchedule = [...updatedSchedule, ...saturdaySchedule];
            const scheduleMessage = formatScheduleMessage(finalSchedule, true);

            console.log(finalSchedule)
            await context.send({
                message: scheduleMessage,
                keyboard: JSON.stringify(createKeyboard())
            });
        }
        else{
            const lessonsResponse = await axios.get(`${process.env.HOST}/teachers/` + encodeURIComponent(teacherName) + '/lessons', {
                params: { odd: week_type }
            });

            const replacementsResponse = await axios.get(`${process.env.HOST}/teachers/` + encodeURIComponent(teacherName) + '/replacements');

            const lessons = lessonsResponse.data;
            const replacements = replacementsResponse.data;


            const updatedSchedule = mergeSchedules(lessons, replacements);


            if (updatedSchedule && updatedSchedule.length > 0) {
                const scheduleMessage = formatScheduleMessage(updatedSchedule, true);

                await context.send({
                    message: scheduleMessage,
                    keyboard: JSON.stringify(createKeyboard())
                });
            } else {
                await context.send('Не найдено расписание или замены для этого учителя.');
            }

            userStates.delete(userId);
        }
    }
};
