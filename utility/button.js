module.exports = {
    createKeyboard() {
        return {
            one_time: false,
            buttons: [
                [
                    {
                        action: {
                            type: 'text',
                            label: 'Расписание'
                        },
                        color: 'primary'
                    }
                ],
                [
                    {
                        action: {
                            type: 'text',
                            label: 'Учителя'
                        },
                        color: 'negative'
                    },
                    {
                        action: {
                            type: 'text',
                            label: 'Кабинеты'
                        },
                        color: 'positive'
                    }
                ]
            ]
        };
    },
    createBackButtonKeyboard() {
        return {
            one_time: false,
            buttons: [
                [
                    {
                        action: {
                            type: 'text',
                            label: 'Назад'
                        },
                        color: 'secondary'
                    }
                ]
            ]
        };
    },
    createGroupKeyboard(){
        return {
            one_time: false,
            buttons: [
                [
                    {
                        action: {
                            type: 'text',
                            label: 'Первая'
                        },
                        color: 'primary'
                    },
                    {
                        action: {
                            type: 'text',
                            label: 'Вторая'
                        },
                        color: 'primary'
                    }
                ],
                [
                    {
                        action: {
                            type: 'text',
                            label: 'Назад'
                        },
                        color: 'secondary'
                    }
                ]
            ]
        }
    }
};
