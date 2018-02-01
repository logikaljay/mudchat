var util = require('util')
var Color = require('./color')

var headerItem = (item) => {
    var {label,width} = item
    width = width - label.length - 1

    var spacer = ""
    for (var i = 0; i < width; i++) {
        spacer = spacer + " "
    }

    return util.format("%s[ %s%s%s %s]%s", Color.BLU, Color.WHT, label, spacer, Color.BLU, Color.WHT)
}

module.exports = (items) => {

    var header = ""

    for (var i in items) {
        var item = items[i]

        header += headerItem(item)
    }

    header += "\n"
    header += " "
    for (var i in items) {

        var width = items[i].width
        if (width < items[i].label.length) {
            width = items[i].label.length + 1
        }

        for (var w = 0; w < width; w++) {
            header += "-" 
        }

        header += "-  "
    }
    header = header.trim()
    header += " "

    return header
}