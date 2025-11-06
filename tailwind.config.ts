import colors from 'tailwindcss/colors'

const themeColors = [
    {
        theme: colors.gray,
        primary: colors.blue,
        gradient: {
            from: colors.indigo,
            via: colors.emerald,
            to: colors.purple
        },
        success: colors.green,
        warning: colors.amber,
        info: colors.sky,
        danger: colors.red,
    }
]
const themeColorIndex = Number(process.env.THEME_COLOR) || 0
const themeColor = themeColors[themeColorIndex] || themeColors[0]

export default {
    // darkMode: 'class',
    theme: {
        extend: {
            colors: themeColor,
        },
    },
}
