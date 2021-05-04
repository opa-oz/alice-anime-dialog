function formatResponse(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res.json();
    } else {
        throw Error(res.statusText);
    }
}

export default formatResponse;
