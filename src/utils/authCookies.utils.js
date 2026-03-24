
export const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    })

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}