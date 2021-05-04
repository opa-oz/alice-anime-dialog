async function wait(time = 1200): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

export default wait;
