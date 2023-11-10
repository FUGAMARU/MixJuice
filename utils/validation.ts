export const isValidEmail = (email: string) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)

export const isValidPassword = (password: string) =>
  /^[\!\"\#\$%\&\x27\(\)\*\+,\-\./0-9:;<=>?@A-Za-z[\]\^_`\{|}~]{6,}$/.test(
    password
  )
