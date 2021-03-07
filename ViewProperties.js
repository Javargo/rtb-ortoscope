//****************************
// VIEWPROPERTIES OBJECT
//****************************

//Changes:
// 2021-02-21: Moved to separate file; review

function ViewProperties()
{
	this.x=0;
	this.y=0;
	this.scale=1;
	return this;
};

ViewProperties.prototype.centerDrawingOnCanvas=function(drawing, canvas)
{
	let b=drawing.getBoundingBox();
	let scaleGuessH=canvas.width/b.getWidth();
	let scaleGuessV=canvas.height/b.getHeight();
	this.scale=scaleGuessH<scaleGuessV?scaleGuessH:scaleGuessV;
	this.x=canvas.width/2.0-this.scale*b.getWidth()/2.0-this.scale*b.p0.x;
	this.y=canvas.height/2.0+this.scale*b.getHeight()/2.0+this.scale*b.p0.y;
};

ViewProperties.prototype.pan=function(dx, dy)
{
	this.x+=dx;
	this.y+=dy;
};
