
export const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        maxAge: 15 * 60 * 1000,
    })
}