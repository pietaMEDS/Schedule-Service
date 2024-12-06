const mergeSchedules = (lessons, replacements) => {
    let mergedSchedules = [...lessons];

    replacements.forEach(replacement => {
        const existingLesson = mergedSchedules.find(lesson => lesson.ordinal === replacement.ordinal && lesson.datOfWeek === replacement.datOfWeek);

        if (existingLesson) {
            Object.assign(existingLesson, {
                subject: replacement.subject,
                teacher: replacement.teacher,
                location: replacement.location

            });
        } else {
            mergedSchedules.push({
                ...replacement,
                id: mergedSchedules.length + 1
            });
        }
    });

    return mergedSchedules;
};

module.exports = mergeSchedules;
