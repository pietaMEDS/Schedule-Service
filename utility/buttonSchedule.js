const { createBackButtonKeyboard, createGroupKeyboard, createKeyboard } = require('../utility/button');

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

    userStates.set(context.peerId, 'awaiting_subgroup');
    await context.send({
        message: `Вы выбрали группу: ${group}. Теперь выберите подгруппу.`,
        keyboard: JSON.stringify(createGroupKeyboard())
    });

    return true;
};

const handleSubgroupState = async (context, userStates) => {
    const subgroup = context.text.trim();

    if (subgroup === 'Первая' || subgroup === 'Вторая') {
        userStates.delete(context.peerId);
        await context.send({
            message: `Расписание будет загружено позже`,
            keyboard: JSON.stringify(createKeyboard())
        });
        return true;
    }

    if (subgroup === 'Назад') {
        userStates.set(context.peerId, 'awaiting_group');
        await context.send({
            message: 'Вы вернулись назад. Введите вашу группу:',
            keyboard: JSON.stringify(createBackButtonKeyboard())
        });
        return true;
    }

    await context.send('Пожалуйста, выберите группу.');
    return false;
};

module.exports = {
    handleGroupState,
    handleSubgroupState,
};
