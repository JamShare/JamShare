

const constants = {
    berry: "ws://berryhousehold.ddns.net:3001",
    heroku: "https://gentle-lake-00593.herokuapp.com"
}

const config = {
    build_with_heroku: true
}

export const getSocketEndpoint = () => {
    return config.build_with_heroku ? constants.heroku : constants.berry;
}