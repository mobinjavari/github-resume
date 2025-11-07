import colors from 'tailwindcss/colors'

const themeColors = {
    default: {
        theme: colors.gray,
        primary: colors.blue,
        gradient: {
            from: colors.indigo[600],
            via: colors.emerald[500],
            to: colors.purple[600]
        },
        success: colors.green,
        warning: colors.amber,
        info: colors.teal,
        danger: colors.red
    }
}
const themeColorName = (process.env.THEME_COLOR || 'default') as keyof typeof themeColors
const themeColor = themeColors[themeColorName] ?? themeColors.default

export default {
    theme: {
        extend: {
            colors: themeColor
        }
    }
}
