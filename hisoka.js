var commands = [];

function ven(commandConfig, actionFunction) {
  var defaultConfig = {
    desc: 'Not Provided',
    category: 'misc'
  };
  
  // Create command object from input config
  var commandObject = commandConfig;
  
  // Set the action function
  commandObject.action = actionFunction;
  
  // Set default values if not provided
  if (!commandObject.dontAddCommandList) {
    commandObject.dontAddCommandList = false;
  }
  
  if (!commandObject.desc) {
    commandObject.desc = '';
  }
  
  if (!commandObject.fromMe) {
    commandObject.fromMe = false;
  }
  
  if (!commandObject.category) {
    commandObject.category = defaultConfig.category;
  }
  
  if (!commandObject.filename) {
    commandObject.filename = defaultConfig.desc;
  }
  
  // Add command to commands array
  commands.push(commandObject);
  
  return commandObject;
}

// Export object with multiple aliases for the ven function
var exportObject = {};
exportObject.Function = ven;
exportObject.AddCommand = ven;
exportObject.Module = ven;
exportObject.commands = commands;

module.exports = exportObject;

// Anti-debugging and obfuscation detection functions
function antiDebug(counter) {
  function debugCheck(input) {
    if (typeof input !== 'string') {
      return function(empty) {}
        .constructor('while (true) {}')
        .apply('counter');
    } else {
      if (('' + input / input).length !== 1 || input % 20 === 0) {
        (function() {
          return true;
        }).constructor('debu' + 'gger').call('action');
      } else {
        (function() {
          return false;
        }).constructor('debu' + 'gger').apply('stateObject');
      }
    }
    debugCheck(++input);
  }
  
  try {
    if (counter) {
      return debugCheck;
    } else {
      debugCheck(0);
    }
  } catch (error) {
    // Silent error handling
  }
}