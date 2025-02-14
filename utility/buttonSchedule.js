const axios = require('axios');
const { createBackButtonKeyboard, createGroupKeyboard, createKeyboard } = require('../utility/button');
const mergeSchedules = require('../utility/scheduleMerger');
require('dotenv').config();
const dotenv = require('dotenv');
dotenv.config();

const handleGroupState = async (context, userStates) => {
    const group = context.text.trim();

    if (group === 'Назад') {
        userStates.delete(context.peerId);
        await context.send({
            message: 'Вы вернулись в главное меню. Выберите команду.',
            keyboard: JSON.stringify(createKeyboard())
        });
        return true;
    }

    userStates.set(context.peerId, { state: 'awaiting_subgroup', groupName: group });
    await context.send({
        message: `Вы выбрали группу: ${group}. Теперь выберите подгруппу.`,
        keyboard: JSON.stringify(createGroupKeyboard())
    });

    return true;
};

const handleSubgroupState = async (context, userStates) => {
    const subgroup = context.text.trim();
    const userState = userStates.get(context.peerId);
    const { groupName } = userState;
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


    let subgroupNumber;

    if (subgroup === 'Первая') {
        subgroupNumber = 1;
    } else if (subgroup === 'Вторая') {
        subgroupNumber = 2;
    }

    if (subgroupNumber) {
        userStates.delete(context.peerId);

        try {
            if (DayOfWeek === 6) {

                let SaturdayResponse = await axios.get(`${process.env.HOST}/lessons`, {
                    params: { groupName, subgroup: subgroupNumber, odd: week_type }
                });

                let saturdayReplacementResponse = await axios.get(`${process.env.HOST}/replacement`, {
                    params: { groupName, subgroup: subgroupNumber }
                });

                const SaturdayReplacementResponse = saturdayReplacementResponse.data.filter(replacement => replacement.datOfWeek === "SATURDAY");
                const SaturdayLessons = SaturdayResponse.data.filter(lesson => lesson.dayOfWeek === "SATURDAY");

                const saturdaySchedule = mergeSchedules(SaturdayLessons, SaturdayReplacementResponse);
                console.log(saturdaySchedule);


                if (week % 2) {
                    week_type = 1;
                } else {
                    week_type = 2;
                }
                
                const lessonsResponse = await axios.get(`${process.env.HOST}/lessons`, {
                    params: { groupName, subgroup: subgroupNumber, odd: week_type }
                });

                const replacementResponse = await axios.get(`${process.env.HOST}/replacement`, {
                    params: { groupName, subgroup: subgroupNumber }
                });

                let updatedSchedule = mergeSchedules(lessonsResponse.data, replacementResponse.data);
                
                updatedSchedule = updatedSchedule.filter(lesson => lesson.dayOfWeek !== "SATURDAY");
                
                const finalSchedule = [...updatedSchedule, ...saturdaySchedule];
                return finalSchedule;

            } else {
                const lessonsResponse = await axios.get(`${process.env.HOST}/lessons`, {
                    params: { groupName, subgroup: subgroupNumber, odd: week_type }
                });

                const replacementResponse = await axios.get(`${process.env.HOST}/replacement`, {
                    params: { groupName, subgroup: subgroupNumber }
                });

                const lessons = lessonsResponse.data;
                const replacements = replacementResponse.data;

                const updatedSchedule = mergeSchedules(lessons, replacements);
                return updatedSchedule;
            }
        } catch (error) {
            console.error('Ошибка при запросе к API:', error);

            await context.send({
                message: 'Произошла ошибка при получении данных.\nОбычно такое происходит при технических работах\nПопробуйте позже.',
                keyboard: JSON.stringify(createKeyboard())
            });

            return null;
        }
    }

    await context.send('Пожалуйста, выберите подгруппу.');
    return false;
};

module.exports = {
    handleGroupState,
    handleSubgroupState
};
