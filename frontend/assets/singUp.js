function validate(node) {
    if (node.id === 'password') {
        // Minimum eight characters, at least one letter and one number:
        // "^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
        
        if (passwordRegex.test(node.value)) {
            node.style['background-color'] = '#FFFFFF'
            node.style['border'] = '1px solid #008000'
        } else {
            node.style['background-color'] = '#ec5353'
            node.style['border'] = 'none'
        }
    } else {
        // Minimun 3 character
        if (node.value.length >= 3) {
            node.style['background-color'] = '#FFFFFF'
            node.style['border'] = '1px solid #008000'
        } else {
            node.style['background-color'] = '#ec5353'
            node.style['border'] = 'none'
        }
    }
}
