const mergeSchedules = (lessons, replacements) => {
    try {
        let mergedSchedules = [...lessons];

        replacements.forEach(replacement => {
            replacement.dayOfWeek = replacement.datOfWeek;
            replacement.isReplacement = true;

            const existingLesson = mergedSchedules.find(lesson =>
                lesson.ordinal === replacement.ordinal &&
                lesson.dayOfWeek === replacement.dayOfWeek
            );

            if (existingLesson) {
                Object.assign(existingLesson, replacement);
            } else {
                mergedSchedules.push({
                    ...replacement,
                    id: mergedSchedules.length + 1
                });
            }
        });

        mergedSchedules.sort((a, b) => a.ordinal - b.ordinal);

        return mergedSchedules;
    }catch (e){
        console.error(e)
    }
};

module.exports = mergeSchedules;
