module.exports = [
  {
    name: 'qr',
    description: 'Generate a QR Code',
    options: [{ name: 'text', description: 'Text to convert', type: 3, required: true }]
  },
  {
    name: 'barcode_gen',
    description: 'Generate a Barcode',
    options: [{ name: 'text', description: 'Text to convert', type: 3, required: true }]
  },
  {
    name: 'urls',
    description: 'Shorten a URL',
    options: [{ name: 'link', description: 'The URL to shorten', type: 3, required: true }]
  },
  {
    name: 'dictionary',
    description: 'Get word definition',
    options: [{ name: 'word', description: 'English word', type: 3, required: true }]
  },
  {
    name: 'pass_gen',
    description: 'Generate a strong password',
    options: [{ name: 'length', description: 'Length (default 12)', type: 4, required: false }]
  },
  {
    name: 'ip_info',
    description: 'Get IP details',
    options: [{ name: 'ip', description: 'IP Address', type: 3, required: true }]
  },
  {
    name: 'say',
    description: 'Text to Speech',
    options: [{ name: 'text', description: 'Text to speak', type: 3, required: true }]
  },
  {
    name: 'help',
    description: 'Show available commands'
  }
];
