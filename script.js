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

// Instructions prompt and password generate function
function generatePassword() {
  alert ("Answer the following questions in order to generate your random password.");

  // Password length parameters and prompt
  var inValid = true;
  while (inValid) {
    var passwordLength = Number(prompt("How many characters would you like your password to be?\nMust be between 8 and 128 characters"));
    if (passwordLength >= 8 && passwordLength <= 128) {
      inValid = false;
    } else if (passwordLength == 0) {
        window.close()
    } else {
      alert ("Invalid input. Please recheck character parameters and try again.");
    }
  }
  alert("Your password length:\n" + passwordLength + " characters.\n\nFollow the prompts to choose if your password will contain numbers, uppercase, lowercase, and/or special characters.\nPlease choose at least one option.");

  //Character type and prompt
  while (!inValid) {
    var lowerCase = confirm("Would you like to include lowercase letters?\nSelect cancel to skip character type.");
    var upperCase = confirm("Would you like to include uppercase letters?\nSelect cancel to skip character type.");
    var numeric = confirm("Would you like to include numbers?\nSelect cancel to skip character type.");
    var special = confirm("Would you like to include special characters?\nSelect cancel to skip character type.");
    alert("You chose: \n Lowercase Letters: " + lowerCase + "\n Uppercase Letters: " + upperCase + "\n Numbers: " + numeric + "\n Special Characters: " + special + "\n Your password length: " + passwordLength + " characters.");
    if (lowerCase == true || upperCase == true || numeric == true || special == true) {
      inValid = true;
    } else {
      alert("Invalid selection. At least one option must be selected. Please recheck parameters and try again");
    }
  }

  // Password character options
  if (lowerCase == true) {lowerCase = "abcdefghijklmnopqrstuvwxyz"
  } else {lowerCase = ""
  } if (upperCase == true) {upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  } else {upperCase = ""
  } if (numeric == true) {numeric = "1234567890"
  } else {numeric = ""
  } if (special == true) {special = "!#$%&'()*+,-./:;<=>?@[]^_`{|}~"
  } else {special = ""
  }

  //Merges options into string
  var grandString = special.concat(lowerCase, upperCase, numeric);

  // Math for randomization
  var randomNumber = "";
  for (var i = 0; i <passwordLength; i++) {
    randomNumber += grandString [Math.floor(Math.random() * grandString.length)];
  }
  return randomNumber;

  // Copy Password javascript
  function copyText() {
    var copyText = document.getElementById("password");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
  }
}