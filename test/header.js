const {describe, before, it} = require('mocha')
const {expect} = require('code')

var Header = require('../core/header')
describe('headers', () => {
    
    it('should format a header correctly', (done) => {

        var header = Header([
            {
                label: 'name',
                width: 22
            },
            {
                label: 'age',
                width: 5
            },
            {
                label: 'some long title',
                width: 10
            }
        ])

        expect(header).to.exist()
        done()
    })
})