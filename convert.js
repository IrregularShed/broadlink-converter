/*
0: 0000
1: frequency=1/(codes[1]*0.241246)
2, 3: something about pulse data length
*/

function pronto2lirc(pronto) {
  const hexArray = pronto.split(' ');

  if (hexArray[0] !== '0000') {
    throw new Error('Pronto code should start with 0000');
  }

  const intArray = hexArray.map(val => {
    const intVal = parseInt(val, 16);
    if (isNaN(intVal) || intVal > 65535 || intVal < 0) {
      throw new Error('Crap in the pronto code');
    }
    return intVal;
  });

  if (intArray.length !== (intArray[2] + intArray[3]) * 2 + 4) {
    throw new Error(`Length doesn't match what is expected`);
  }

  const freq = 1 / (intArray[1] * 0.241226);

  intArray.splice(0, 4);

  return intArray.map(val => Math.round(val / freq));
}

function lirc2broadlink(pulses) {
  const valArray = pulses.map(pulse => {
    const val = Math.floor(pulse * 269 / 8192);
    const hexVal = val.toString(16);
    if (val < 256) {
      return hexVal;
    } else {
      if (hexVal.length === 3) {
        return '000' + hexVal;
      }
      return '00' + hexVal;
    }
  });

  let hexLength = ('0000' + (valArray.length + 2).toString(16)).substr(-4);

  // sort out endian nonsense -- yay yay yay, such joy
  hexLength = hexLength.substr(2) + hexLength.substr(0, 2);

  valArray.unshift('2600', hexLength);
  valArray.push('0d05');

  let rtnStr = valArray.join('');
  const requiredPadding = (rtnStr.length + 8) % 16; // I have no idea why it has to be this, but it does
  if (requiredPadding) {
    rtnStr += '0000000000000000'.substr(0, requiredPadding);
  }
  return rtnStr;
}

const testCode = `0000 006D 0000 0022 00AC 00AC 0015 0040 0015 0040 0015 0040 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0040 0015 0040 0015 0040 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0040 0015 0040 0015 0015 0015 0015 0015 0040 0015 0040 0015 0040 0015 0040 0015 0015 0015 0015 0015 0040 0015 0040 0015 0015 0015 0689`;
const testPulses = [4523, 4523, 552, 1683, 552, 1683, 552, 1683, 552, 552, 552, 552, 552, 552, 552, 552, 552, 552, 552, 1683, 552, 1683, 552, 1683, 552, 552, 552, 552, 552, 552, 552, 552, 552, 552, 552, 552, 552, 552, 552, 552, 552, 1683, 552, 1683, 552, 552, 552, 552, 552, 1683, 552, 1683, 552, 1683, 552, 1683, 552, 552, 552, 552, 552, 1683, 552, 1683, 552, 552, 552, 43993];
const testBroadlink = `26004600949412371237123712121212121212121212123712371237121212121212121212121212121212121237123712121212123712371237123712121212123712371212120005a40d05`;

console.log(lirc2broadlink(pronto2lirc(testCode)));
console.log(testBroadlink);