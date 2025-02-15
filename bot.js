const {VK} = require('vk-io');
const {HearManager} = require('@vk-io/hear');
const {createKeyboard} = require('./utility/button');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const dotenv = require('dotenv');
const teacherModule = require("./commands/teachers");
const classroomsModule = require("./commands/classrooms");
const sheduleModel = require("./commands/schedule")
dotenv.config();

const vk = new VK({
    token: process.env.TOKEN
});

const userStates = new Map();

const commandsMap = {
    'Расписание': 'schedule',
    'Учителя': 'teachers',
    'Кабинеты': 'classrooms',
};

const command = new HearManager();

async function executeCommand(commandLabel, context) {
    const commandFile = commandsMap[commandLabel];

    if (!commandFile) {
        return await context.send('Команда не найдена.');
    }

    const commandFilePath = path.join(__dirname, 'commands', `${commandFile}.js`);

    if (fs.existsSync(commandFilePath)) {
        try {
            const commandModule = require(commandFilePath);
            if (commandModule.execute) {
                await commandModule.execute(context, userStates);
            }
        } catch (error) {
            console.error('Ошибка при выполнении команды:', error);
            await context.send('Произошла ошибка при выполнении команды.');
        }
    } else {
        console.log(`Команда не найдена: ${commandFile}`);
        await context.send('Команда не найдена.');
    }
}

async function handleStartCommand(context) {
    userStates.delete(context.peerId);

    await context.send({
        message: 'Привет! Выберите команду.',
        keyboard: JSON.stringify(createKeyboard())
    });
}

async function handleBackCommand(context) {
    userStates.delete(context.peerId);

    await context.send({
        message: 'Вы вернулись в главное меню. Выберите команду.',
        keyboard: JSON.stringify(createKeyboard())
    });
}

command.hear('Назад', handleBackCommand);

vk.updates.on('message', async (context) => {
    if (context.senderId === vk.id || context.isOutbox) {
        return;
    }
    const text = context.text?.trim();

    const state = userStates.get(context.peerId);

    if (text === 'Начать' || text === "Назад" || text === "/start") {
        await handleStartCommand(context);
        return;
    }

    if (state) {
        if (state.state === 'awaiting_teacher_name') {
            await teacherModule.handleMessage(context, userStates);
            return;
        }


        if (state.state === 'awaiting_location_number') {
            await classroomsModule.handleMessage(context, userStates);
            return;
        }

        if (state.state === 'awaiting_group') {
            await sheduleModel.handleMessage(context, userStates);
            return;

        }
        if (state.state === 'awaiting_subgroup') {
            await sheduleModel.handleMessage(context, userStates);
            return;

        }

        await executeCommand(text, context);

    } else {
        await executeCommand(text, context);
    }

});

vk.updates.start()
    .then(() => console.log('Бот запущен!'))
    .catch((error) => console.error('Ошибка при запуске бота:', error));