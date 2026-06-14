const PASSWORD_REGEX = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/;

function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  return PASSWORD_REGEX.test(password);
}

module.exports = { validatePassword };
