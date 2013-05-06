var Iconic = require('iconic');

describe('Iconic', function () {
  it("Doesn't insert anything until told to", function () {
    expect(document.querySelector('.cropper-crop-pane')).to.not.be.ok;
    expect(document.querySelector('.sensorium')).to.not.be.ok;
    expect(document.querySelector('.iconic')).to.not.be.ok;
  });

  it("Doesn't throw an error when not given a container", function () {
    expect(function () {
      new Iconic();
    }).to.not.throw();
  });

  describe('startCapture', function () {
    beforeEach(function () {
      navigator.getUserMedia = sinon.stub();
    });

    it("Starts sensorium", function () {
      new Iconic().startCapture();
      expect(navigator.getUserMedia.calledOnce).to.equal(true);
    });

    it("Propagates sensorium events", function () {
      navigator.getUserMedia.callsArgWith(2, { error: 2 });

      var iconic = new Iconic();
      var spy = sinon.spy();
      iconic.once('getUserMedia:error', spy);
      iconic.startCapture();

      expect(spy.callCount).to.equal(1);
      expect(spy.getCall(0).args[0]).to.eql({ error: 2 });
    });
  });
});
