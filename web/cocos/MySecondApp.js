var MySecondApp = cc.Layer.extend(
{
    init:function()
    {
        var layer1 = cc.LayerColor.create(
            new cc.Color4B(128, 128, 128, 255), 600, 600),
            jetSprite = cc.Sprite.create("./images/image.png");

        layer1.setPosition(new cc.Point(0.0,0.0));
        layer1.addChild(jetSprite);

        var size = cc.Director.getInstance().getWinSize();
        jetSprite.setPosition(new cc.Point(size.width/2,size.height/2));

        var rotationAmount = 0;
        jetSprite.schedule(function()
        {

            this.setRotation(rotationAmount++);
            if(rotationAmount > 360)
                rotationAmount = 0;
        });


        this.addChild(layer1);
        return true;
    }
});


MySecondAppScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new MySecondApp();
        layer.init();
        this.addChild(layer);
    }
})

