import bcrypt from "bcrypt";

const hashPassword = (password) => {
  const salt_rounds = 10;
  const salt = bcrypt.genSaltSync(salt_rounds);
  const hashed_password = bcrypt.hashSync(password, salt);
  return hashed_password;
};

export default hashPassword;
