const { handleGroupState, handleSubgroupState } = require('../utility/buttonSchedule');
const { createBackButtonKeyboard } = require('../utility/button');

const stateHandlers = {
    'awaiting_group': handleGroupState,
    'awaiting_subgroup': handleSubgroupState
};

module.exports.execute = async (context, userStates) => {
    userStates.set(context.peerId, 'awaiting_group');

    await context.send({
        message: 'Введите вашу группу',
        keyboard: JSON.stringify(createBackButtonKeyboard())
    });
};

module.exports.handleMessage = async (context, userStates) => {
    const state = userStates.get(context.peerId);
    const handler = stateHandlers[state];

    if (handler) {
        const isHandled = await handler(context, userStates);
        if (isHandled) return;
    }

    await context.send('Неизвестное состояние или ошибка обработки.');
};
