const { handleGroupState, handleSubgroupState } = require('../utility/buttonSchedule');
const { createBackButtonKeyboard, createKeyboard } = require('../utility/button');
const { formatScheduleMessage } = require('../utility/scheduleFormatter');

const stateHandlers = {
    'awaiting_group': handleGroupState,
    'awaiting_subgroup': handleSubgroupState
};

module.exports.execute = async (context, userStates) => {
    userStates.set(context.peerId, { state: 'awaiting_group' });

    await context.send({
        message: 'Введите вашу группу, пример: Испвк-21-1',
        keyboard: JSON.stringify(createBackButtonKeyboard())
    });
};

module.exports.handleMessage = async (context, userStates) => {
    const userState = userStates.get(context.peerId);
    const handler = stateHandlers[userState.state];

    if (handler) {
        const result = await handler(context, userStates);

        if (Array.isArray(result) && result.length > 0) {
            const scheduleMessage = formatScheduleMessage(result, 'shedule');

            await context.send({
                message: scheduleMessage,
                keyboard: JSON.stringify(createKeyboard())
            });
        }
    }
};
