// Assignment Code
var generateBtn = document.querySelector("#generate");

// Write password to the #password input
function writePassword() {
  var password = generatePassword();
  var passwordText = document.querySelector("#password");

  passwordText.value = password;

}

// Add event listener to generate button
generateBtn.addEventListener("click", writePassword);

// First prompt with instructions
function generatePassword() {
  alert ("Answer the following questions in order to generate your random password.");

    // User input for password length and validation for a number between specified values
    var inValid = true;
    while (inValid) {
      var passwordLength = Number(prompt('How many characters would you like your password to be?\nMust be between 8 and 128 characters'));
      if (passwordLength >= 8 && passwordLength <= 128) {
        inValid = false;
      } else {
        alert ('Invalid input. Please recheck character parameters and try again.');
      }
    }
    alert('Your password length:\n' + passwordLength + ' characters.\n\nFollow the prompts to choose if your password will contain numbers, special, uppercase, and lowercase characters.\nPlease choose at least 1 option.');
  }