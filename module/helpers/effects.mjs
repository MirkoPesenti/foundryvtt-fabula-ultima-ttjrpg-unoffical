export async function changeProjectProgress( event, item, increase = true, value = undefined ) {
    event.preventDefault();
    let newValue = item.system.progress.current;
    if ( value == undefined ) {

        if ( increase )
            newValue += item.system.progress.step;
        else
            newValue -= item.system.progress.step;

    } else {
        newValue = value;
    }
    await item.update({ 'system.progress.current': newValue });
}