//****************************************
//TWODGEOMETRY LIBRARY
//****************************************
//Copyright: Major, Balazs
//E-mail: majorstructures@gmail.com
//****************************************
//Change history
//2019-01-20 Copy and from method added to each object
//2019-01-16 Copy method of Vector and Polygon added
//2019-01-02 Circle and Polygon added
//2018-12-29 Code restructured
//2018-12-22 First letter of object constructor functions turned to capital
//2018-12-22 Member functions attached to the prototype

//****************************************
//Todo
// - Precise M methods for CurvedSection and Arc

//****************************************
//Dependencies
//none

//****************************************

//=======================
//TWODGEOMTERY OBJECT	
//=======================
var TwoDGeometry={};

//=======================
//VECTOR OBJECT	
//=======================			
TwoDGeometry.Vector=function(x, y)
{
	this.x=x;
	this.y=y;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.from=function(template)
{
	this.x=template.x;
	this.y=template.y;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.copy=function()
{
	return new TwoDGeometry.Vector(this.x, this.y);
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.toString=function()
{
	return "{"+this.x+", "+this.y+"}";
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.getLength2=function()
{
	return Math.pow(this.x, 2)+Math.pow(this.y, 2);
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.getLength=function()
{
	return Math.sqrt(this.getLength2());
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.perpendicular=function()
{
	return new TwoDGeometry.Vector(-this.y, this.x);
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.unitVector=function()
{
	var l=this.getLength();
	return new TwoDGeometry.Vector(this.x/l, this.y/l);
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.multiplyNew=function(m)
{
	return new TwoDGeometry.Vector(m*this.x, m*this.y);
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.multiplyThis=function(m)
{
	this.x*=m;
	this.y*=m;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.plusNew=function(v)
{
	return new TwoDGeometry.Vector(this.x+v.x, this.y+v.y);
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.plusThis=function(v)
{
	this.x+=v.x;
	this.y+=v.y;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.minusNew=function(v)
{
	return new TwoDGeometry.Vector(this.x-v.x, this.y-v.y);
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.minusThis=function(v)
{
	this.x-=v.x;
	this.y-=v.y;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.rotateNew=function(v)
{
	var u=v.unitVector();
	return new TwoDGeometry.Vector(u.x*this.x-u.y*this.y, u.y*this.x+u.x*this.y);
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.rotateThis=function(v)
{
	var u=v.unitVector();
	var x=u.x*this.x-u.y*this.y;
	var y=u.y*this.x+u.x*this.y;
	this.x=x;
	this.y=y;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.scalarProduct=function(v)
{
	return this.x*v.x+this.y*v.y;
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.vectorProduct=function(v)
{
	return this.x*v.y-this.y*v.x;
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.crossProduct=function(a, b)
{
	return a.x*b.y-a.y*b.x;
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.distance=function(v)
{
	return this.minusNew(v).getLength();
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.getAngle=function()
{
	if(this.y>=this.x)
	{
		if(this.y>=-this.x)
		{
			return Math.PI/2.0-Math.atan(this.x/this.y);
		}
		else
		{
			return Math.PI+Math.atan(this.y/this.x);
		}	
	}
	else
	{
		if(this.y>=-this.x)
		{
			if(this.y>=0.0)
			{
				return Math.atan(this.y/this.x);
			}
			else
			{
				return 2.0*Math.PI+Math.atan(this.y/this.x);
			}	
		}
		else
		{
			return 3.0/2.0*Math.PI-Math.atan(this.x/this.y);
		}	
	}
};

//-----------------------------------------------------------------------
TwoDGeometry.Vector.prototype.getBoundingBox=function()
{
	return new TwoDGeometry.BoundingBox(this);
};

//=======================
//BOUNDINGBOX OBJECT
//=======================
TwoDGeometry.BoundingBox=function(p0, p1, p2, p3)
{
	if(p3!=undefined)
	{
		this.p0=new TwoDGeometry.Vector(Math.min(p0.x, p1.x, p2.x, p3.x), Math.min(p0.y, p1.y, p2.y, p3.y));
		this.p1=new TwoDGeometry.Vector(Math.max(p0.x, p1.x, p2.x, p3.x), Math.max(p0.y, p1.y, p2.y, p3.y));
	}
	else
	{
		if(p2!=undefined)
		{
			this.p0=new TwoDGeometry.Vector(Math.min(p0.x, p1.x, p2.x), Math.min(p0.y, p1.y, p2.y));
			this.p1=new TwoDGeometry.Vector(Math.max(p0.x, p1.x, p2.x), Math.max(p0.y, p1.y, p2.y));
		}
		else
		{
			if(p1!=undefined)
			{
				this.p0=new TwoDGeometry.Vector(Math.min(p0.x, p1.x), Math.min(p0.y, p1.y));
				this.p1=new TwoDGeometry.Vector(Math.max(p0.x, p1.x), Math.max(p0.y, p1.y));
			}
			else
			{
				//this.p0=new TwoDGeometry.Vector(p0.x, p0.y);
				//this.p1=new TwoDGeometry.Vector(p0.x, p0.y);;
				this.p0=p0.copy();
				this.p1=p0.copy();
			}
		}
	}
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.BoundingBox.prototype.from=function(template)
{
	this.p0=template.p0.copy();
	this.p1=template.p1.copy();
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.BoundingBox.prototype.copy=function()
{
	return new TwoDGeometry.BoundingBox(this.p0, this.p1);
};

//-----------------------------------------------------------------------
//to text representation
TwoDGeometry.BoundingBox.prototype.toString=function()
{
	return "[("+this.p0.x+", "+this.p0.y+"), ("+this.p1.x+", "+this.p1.y+")]";
};

//-----------------------------------------------------------------------
TwoDGeometry.BoundingBox.prototype.plusNew=function(b) //extends the current BoundingBox with another one
{
	return new TwoDGeometry.BoundingBox(this.p0, this.p1, b.p0, b.p1);
};

//-----------------------------------------------------------------------
TwoDGeometry.BoundingBox.prototype.plusThis=function(b) //extends the current BoundingBox with another one
{
	this.p0.x=Math.min(this.p0.x, b.p0.x);
	this.p0.y=Math.min(this.p0.y, b.p0.y);
	this.p1.x=Math.max(this.p1.x, b.p1.x);
	this.p1.y=Math.max(this.p1.y, b.p1.y);
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.BoundingBox.prototype.getWidth=function()
{
	return this.p1.x-this.p0.x;
};

//-----------------------------------------------------------------------
TwoDGeometry.BoundingBox.prototype.getHeight=function()
{
	return this.p1.y-this.p0.y;
};

//=======================
//SECTION OBJECT
//=======================
TwoDGeometry.Section=function(p0, p1)
{
	this.p0=p0.copy();
	this.p1=p1.copy();
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.from=function(template)
{
	this.p0=template.p0.copy();
	this.p1=template.p1.copy();
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.copy=function()
{
	return new TwoDGeometry.Section(this.p0, this.p1);
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.getAngle=function()
{
	return this.p1.minusNew(this.p0).getAngle();
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.toString=function()
{
	return "Section {"+this.p0.toString()+", "+this.p1.toString()+"}";
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.multiplyThis=function(f)
{
	this.p0.multiplyThis(f);
	this.p1.multiplyThis(f);
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.plusThis=function(v)
{
	this.p0.plusThis(v);
	this.p1.plusThis(v);
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.minusThis=function(v)
{
	this.p0.minusThis(v);
	this.p1.minusThis(v);
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.rotateThis=function(v)
{
	this.p0.rotateThis(v);
	this.p1.rotateThis(v);
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.getBoundingBox=function()
{
	return new TwoDGeometry.BoundingBox(this.p0, this.p1);
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.getM0x=function()
{
	return (this.p0.x-this.p1.x)*(this.p1.y+this.p0.y)/2.0;
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.getM1x=function()
{
	return (this.p0.x-this.p1.x)*(this.p0.y*this.p0.y+this.p0.y*this.p1.y+this.p1.y*this.p1.y)/6.0;
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.getM2x=function()
{
	return (this.p0.x-this.p1.x)*(this.p0.y*this.p0.y*this.p0.y+this.p0.y*this.p0.y*this.p1.y+this.p0.y*this.p1.y*this.p1.y+this.p1.y*this.p1.y*this.p1.y)/12.0;
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.addCrossSectionPropertiesTo=function(cp)
{
	var ax=this.p0.x;
	var ay=this.p0.y;
	var bx=this.p1.x;
	var by=this.p1.y;
	cp.A+=(ax-bx)/2*(ay+by);
	cp.Sx+=(ax-bx)/6*(ay*ay+ay*by+by*by);
	cp.Sy+=(ax-bx)/6*(2*ax*ay+ax*by+ay*bx+2*bx*by);
	cp.Ix+=(ax-bx)/12*(ay*ay*ay+ay*ay*by+ay*by*by+by*by*by);
	cp.Iy+=(ax-bx)/12*(3*ax*ax*ay+2*ax*ay*bx+ax*ax*by+ay*bx*bx+2*ax*bx*by+3*bx*bx*by);
	cp.Ixy+=(ax-bx)/24*(3*ax*ay*ay+2*ax*ay*by+ax*by*by+ay*ay*bx+2*ay*bx*by+3*bx*by*by);
    if(ay>=0)
    {
        if(by>=0)
        {
            cp.Wplxp+=2*(ax-bx)/6*(ay*ay+ay*by+by*by);
        }
        else
        {
            var sy=0;
            var sx=ax+ay*(bx-ax)/(ay-by);
            cp.Wplxp+=2*(ax-sx)/6*(ay*ay+ay*sy+sy*sy);
            cp.Wplxn+=2*(sx-bx)/6*(sy*sy+sy*by+by*by);
        }
    }
    else
    {
        if(by>=0)
        {
            var sy=0;
            var sx=bx+by*(bx-ax)/(ay-by);
            cp.Wplxp+=2*(sx-bx)/6*(sy*sy+sy*by+by*by);
            cp.Wplxn+=2*(ax-sx)/6*(ay*ay+ay*sy+sy*sy);
        }
        else
        {
            cp.Wplxn+=2*(ax-bx)/6*(ay*ay+ay*by+by*by);
        }
    }
    
    if(ax>=0)
    {
        if(bx>=0)
        {
            cp.Wplyp-=2*(ay-by)/6*(ax*ax+ax*bx+bx*bx);
        }
        else
        {
            var sx=0;
            var sy=ay+ax*(by-ay)/(ax-bx);
            cp.Wplyp-=2*(ay-sy)/6*(ax*ax+ax*sx+sx*sx);
            cp.Wplyn-=2*(sy-by)/6*(sx*sx+sx*bx+bx*bx);
        }
    }
    else
    {
        if(bx>=0)
        {
            var sx=0;
            var sy=by+bx*(by-ay)/(ax-bx);
            cp.Wplyp-=2*(sy-by)/6*(sx*sx+sx*bx+bx*bx);
            cp.Wplyn-=2*(ay-sy)/6*(ax*ax+ax*sx+sx*sx);
        }
        else
        {
            cp.Wplyn-=2*(ay-by)/6*(ax*ax+ax*bx+bx*bx);
        }
    }
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.getIntersectionProportions=function(a, b)
{
	var denominator=TwoDGeometry.Vector.prototype.crossProduct(a.p0, b.p1)+TwoDGeometry.Vector.prototype.crossProduct(a.p1, b.p0)-TwoDGeometry.Vector.prototype.crossProduct(a.p0, b.p0)-TwoDGeometry.Vector.prototype.crossProduct(a.p1, b.p1);
	if(denominator==0)
	{
		return null;
	}
	else
	{
		var r=[];
		r[0]=(-TwoDGeometry.Vector.prototype.crossProduct(b.p0, b.p1)-TwoDGeometry.Vector.prototype.crossProduct(b.p1, a.p0)+TwoDGeometry.Vector.prototype.crossProduct(b.p0, a.p0))/denominator;
		r[1]=(TwoDGeometry.Vector.prototype.crossProduct(a.p0, a.p1)+TwoDGeometry.Vector.prototype.crossProduct(a.p1, b.p0)-TwoDGeometry.Vector.prototype.crossProduct(a.p0, b.p0))/denominator;
		return r;
	}
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.isIntersectionInside=function(ip)
{
	return (ip[0]>=0 && ip[0]<=1 && ip[1]>=0 && ip[1]<=1)?true:false;
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.enlength=function(p)
{
	return this.p0.plusNew((this.p1.minusNew(this.p0)).multiplyNew(p));
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.getLength2=function()
{
	return this.p0.minusNew(this.p1).getLength2();
};

//-----------------------------------------------------------------------
TwoDGeometry.Section.prototype.getLength=function()
{
	return this.p0.minusNew(this.p1).getLength();
};

//=======================
//CIRCLE OBJECT
//=======================
TwoDGeometry.Circle=function(c, r)
//c: center point as Vector
//r: radius
{
	//console.log(JSON.stringify(c));
	this.c=c.copy();
	this.r=r;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Circle.prototype.from=function(template)
{
	this.c=template.c.copy();
	this.r=template.r;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Circle.prototype.copy=function()
{
	return new TwoDGeometry.Circle(this.c, this.r);
};

//-----------------------------------------------------------------------
TwoDGeometry.Circle.prototype.getRadius=function()
{
	return this.r;
};

//-----------------------------------------------------------------------
TwoDGeometry.Circle.prototype.getCenter=function()
{
	return this.c; 
};

//-----------------------------------------------------------------------
TwoDGeometry.Circle.prototype.multiplyThis=function(f)
{
	this.c.multiplyThis(f);
	this.r*=f;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Circle.prototype.plusThis=function(v)
{
	this.c.plusThis(v);
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Circle.prototype.minusThis=function(v)
{
	this.c.minusThis(v);
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Circle.prototype.rotateThis=function(v)
{
	this.c.rotateThis(v);
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Circle.prototype.getBoundingBox=function()

{
	var p0=new TwoDGeometry.Vector(this.c.x-this.r, this.c.y-this.r);
	var p1=new TwoDGeometry.Vector(this.c.x+this.r, this.c.y+this.r);
	var bb=new TwoDGeometry.BoundingBox(p0, p1);
	return bb;
};

//-----------------------------------------------------------------------
TwoDGeometry.Circle.prototype.getLength=function()
{
	return 2*this.r*Math.PI;
};


//=======================
//ARC OBJECT
//=======================
TwoDGeometry.Arc=function(c, r, alpha0, beta)
//c: center point as Vector
//r: radius
//alpha0: start angle (value between 0 and 2PI)
//beta: central angle (value between -2PI and 2PI)
{
	this.c=c.copy();
	this.r=r;
	this.alpha0=alpha0;
	this.beta=beta; 
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.from=function(template)
{
	this.c=template.c.copy();
	this.r=template.r;
	this.alpha0=template.alpha0;
	this.beta=template.beta;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.copy=function()
{
	return new TwoDGeometry.Arc(this.c, this.r, this.alpha0, this.beta);
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.getRadius=function()
{
	return this.r;
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.getStartAngle=function()
{
	return this.alpha0;
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.getCentralAngle=function()
{
	return this.beta;
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.getEndAngle=function()
{
	return this.alpha0+beta;
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.getCenter=function()
{
	return this.c; 
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.getStartPoint=function()
{
	return this.c.plusNew(new TwoDGeomerty.Vector(r*Math.cos(this.getStartAngle())), r*Math.sin(this.getStartAngle())); 
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.getEndPoint=function()
{
	return this.c.plusNew(new TwoDGeomerty.Vector(r*Math.cos(this.getEndAngle())), r*Math.sin(this.getEndAngle())); 
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.multiplyThis=function(f)
{
	this.c.multiplyThis(f);
	this.r*=f;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.plusThis=function(v)
{
	this.c.plusThis(v);
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.minusThis=function(v)
{
	this.c.minusThis(v);
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.rotateThis=function(v)
{
	this.alpha0+=v.getAngle();
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.getBoundingBox=function()
{
	var cp=this.getCenter();
	var sa=this.getStartAngle();
	var ea=this.getEndAngle();
	var rr=this.getRadius();
	var bb=new TwoDGeometry.BoundingBox(this.getStartPoint(), this.getEndPoint());
	if(this.getCentralAngle()>0)
	{
		for(var gamma=Math.PI/2; gamma<4*Math.PI; gamma+=Math.PI/2)
		{
			if(sa<gamma && ea>gamma)
			{
				var rv=new TwoDGeometry.Vector(rr*Math.cos(gamma), rr*Math.sin(gamma));
				bb.plusThis(new TwoDGeometry.BoundingBox(cp.plusNew(rv)));
			}
		}
	}
	else
	{
		for(var gamma=3*Math.PI/2; gamma>-2*Math.PI; gamma-=Math.PI/2)
		{
			if(sa<gamma && ea>gamma)
			{
				var rv=new TwoDGeometry.Vector(rr*Math.cos(gamma), rr*Math.sin(gamma));
				bb.plusThis(new TwoDGeometry.BoundingBox(cp.plusNew(rv)));
			}
		}
	}
	return bb;
};

//-----------------------------------------------------------------------
TwoDGeometry.Arc.prototype.getLength=function()
{
	return this.r*Math.abs(this.beta);
};

//=======================
//CURVEDSECTION OBJECT
//=======================
TwoDGeometry.CurvedSection=function(p0, p1, w)
{
	TwoDGeometry.Section.call(this, p0, p1);
	this.w=w;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype = Object.create(TwoDGeometry.Section.prototype);

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.constructor = TwoDGeometry.CurvedSection;

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.from=function(template)
{
	TwoDGeometry.Section.from.call(template);
	this.beta=template.w;
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.copy=function()
{
	return new TwoDGeometry.CurvedSection(this.p0, this.p1, this.w);
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getRadius=function()
{
	return Math.abs(this.w/2.0+TwoDGeometry.Section.prototype.getLength2.call(this)/8.0/this.w);
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getStartPoint=function()
{
	return this.p0;
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getEndPoint=function()
{
	return this.p1;
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getCenter=function()
{
	var m=this.p0.plusNew(this.p1).multiplyNew(0.5); //Vector
	var pu=this.p1.minusNew(this.p0).perpendicular().unitVector();
	var r=this.getRadius();
	var f=this.w>0?this.w-r:this.w+r;
	return m.plusNew(pu.multiplyNew(f));
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getStartAngle=function()
{
	return this.p0.minusNew(this.getCenter()).getAngle();
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getCentralAngle=function()
{
	return 4*Math.atan(2*this.w/TwoDGeometry.Section.prototype.getLength.call(this));
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getEndAngle=function()
{
	return this.getStartAngle()+this.getCentralAngle();
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getCentralAngle=function()
{
	return -4*Math.atan(2*this.w/TwoDGeometry.Section.prototype.getLength.call(this));
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getArc=function()
{
	return new TwoDGeometry.Arc(this.getCenter(), this.getRadius(), this.getStartAngle(), this.getCentralAngle());
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getBoundingBox=function()
{
	var cp=this.getCenter();
	var sa=this.getStartAngle();
	var ea=this.getEndAngle();
	var rr=this.getRadius();
	var bb=new TwoDGeometry.BoundingBox(this.getStartPoint(), this.getEndPoint());
	if(this.getCentralAngle()>0)
	{
		for(var gamma=Math.PI/2; gamma<4*Math.PI; gamma+=Math.PI/2)
		{
			if(sa<gamma && ea>gamma)
			{
				var rv=new TwoDGeometry.Vector(rr*Math.cos(gamma), rr*Math.sin(gamma));
				bb.plusThis(new TwoDGeometry.BoundingBox(cp.plusNew(rv)));
			}
		}
	}
	else
	{
		for(var gamma=3*Math.PI/2; gamma>-2*Math.PI; gamma-=Math.PI/2)
		{
			if(sa<gamma && ea>gamma)
			{
				var rv=new TwoDGeometry.Vector(rr*Math.cos(gamma), rr*Math.sin(gamma));
				bb.plusThis(new TwoDGeometry.BoundingBox(cp.plusNew(rv)));
			}
		}
	}
	return bb;
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getLength=function()
{
	return this.getRadius()*Math.abs(this.getCentralAngle());
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getLength2=undefined;

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getM0x=function()
{
	var r=this.getRadius();
	var a=this.p0;
	var b=this.p1;
	var c=this.getCenter();
	var alpha=this.getStartAngle();
	var beta=this.getEndAngle();
	var sin_a=(a.y-c.y)/r;
	var cos_a=(a.x-c.x)/r;
	var sin_b=(b.y-c.y)/r;
	var cos_b=(b.x-c.x)/r;
	var i_sin=-cos_b+cos_a;
	var i_sin2=(beta-sin_b*cos_b-alpha+sin_a*cos_a)/2;
	var i_sin3=cos_b*cos_b*cos_b/12-3*cos_b/4-sin_b*sin_b*cos_b*cos_b/4-cos_a*cos_a*cos_a/12+3*cos_a/4+sin_a*sin_a*cos_a*cos_a/4;
	var i_sin4=3*beta/8+sin_b*cos_b*cos_b*cos_b/8-sin_b*sin_b*sin_b*cos_b*cos_b*cos_b/8-sin_b*cos_b/2-3*alpha/8-sin_a*cos_a*cos_a*cos_a/8+sin_a*sin_a*sin_a*cos_a*cos_a*cos_a/8+sin_a*cos_a/2;
	return r*c.y*i_sin+r*r*i_sin2;
};
		
//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getM0x_other=function()
{
	var r=this.getRadius();
	var a=this.p0;
	var b=this.p1;
	var c=this.getCenter();
	return r*r*this.getCentralAngle()/2.0+(a.y+c.y)*(a.x-c.x)/2.0-(b.y+c.y)*(b.x-c.x)/2.0;
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getM0x_approx=function()
{
	var r=this.getRadius();
	var a=this.p0;
	var b=this.p1;
	var c=this.getCenter();
	var startAngle=this.getStartAngle();
	var endAngle=this.getEndAngle();
	var nApprox=Math.ceil(Math.abs(endAngle-startAngle)/0.01);
	var stepAngleApprox=(endAngle-startAngle)/nApprox;
	var M0xApprox=0;
	for(var i=0; i<nApprox; i++)
	{
		var p0=c.plusNew(new TwoDGeometry.Vector(r*Math.cos(startAngle+i*stepAngleApprox), r*Math.sin(startAngle+i*stepAngleApprox)));
		var p1=c.plusNew(new TwoDGeometry.Vector(r*Math.cos(startAngle+(i+1)*stepAngleApprox), r*Math.sin(startAngle+(i+1)*stepAngleApprox)));
		var tempSection=new TwoDGeometry.Section(p0, p1);
		M0xApprox+=tempSection.getM0x();
	}
	return M0xApprox;
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getM1x=function()
{
	var r=this.getRadius();
	var a=this.p0;
	var b=this.p1;
	var c=this.getCenter();
	var alpha=this.getStartAngle();
	var beta=this.getEndAngle();
	var sin_a=(a.y-c.y)/r;
	var cos_a=(a.x-c.x)/r;
	var sin_b=(b.y-c.y)/r;
	var cos_b=(b.x-c.x)/r;
	var i_sin=-cos_b+cos_a;
	var i_sin2=(beta-sin_b*cos_b-alpha+sin_a*cos_a)/2;
	var i_sin3=cos_b*cos_b*cos_b/12-3*cos_b/4-sin_b*sin_b*cos_b*cos_b/4-cos_a*cos_a*cos_a/12+3*cos_a/4+sin_a*sin_a*cos_a*cos_a/4;
	var i_sin4=3*beta/8+sin_b*cos_b*cos_b*cos_b/8-sin_b*sin_b*sin_b*cos_b*cos_b*cos_b/8-sin_b*cos_b/2-3*alpha/8-sin_a*cos_a*cos_a*cos_a/8+sin_a*sin_a*sin_a*cos_a*cos_a*cos_a/8+sin_a*cos_a/2;
	return r*c.y*c.y*i_sin/2+r*r*c.y*i_sin2+r*r*r*i_sin3;
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.getM2x=function()
{
	var r=this.getRadius();
	var a=this.p0;
	var b=this.p1;
	var c=this.getCenter();
	var alpha=this.getStartAngle();
	var beta=this.getEndAngle();
	var sin_a=(a.y-c.y)/r;
	var cos_a=(a.x-c.x)/r;
	var sin_b=(b.y-c.y)/r;
	var cos_b=(b.x-c.x)/r;
	var i_sin=-cos_b+cos_a;
	var i_sin2=(beta-sin_b*cos_b-alpha+sin_a*cos_a)/2;
	var i_sin3=cos_b*cos_b*cos_b/12-3*cos_b/4-sin_b*sin_b*cos_b*cos_b/4-cos_a*cos_a*cos_a/12+3*cos_a/4+sin_a*sin_a*cos_a*cos_a/4;
	var i_sin4=3*beta/8+sin_b*cos_b*cos_b*cos_b/8-sin_b*sin_b*sin_b*cos_b*cos_b*cos_b/8-sin_b*cos_b/2-3*alpha/8-sin_a*cos_a*cos_a*cos_a/8+sin_a*sin_a*sin_a*cos_a*cos_a*cos_a/8+sin_a*cos_a/2;
	return r*c.y*c.y*c.y*i_sin/3+r*r*c.y*c.y*i_sin2+r*r*r*c.y*i_sin3+r*r*r*r*i_sin4/3;
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype._getM2x=function()
{
	var r=this.getRadius();
	var a=this.p0;
	var b=this.p1;
	var c=this.getCenter();
	var startAngle=this.getStartAngle();
	var endAngle=this.getEndAngle();
	var nApprox=Math.ceil(Math.abs(endAngle-startAngle)/0.01);
	var stepAngleApprox=(endAngle-startAngle)/nApprox;
	var M2xApprox=0;
	for(var i=0; i<nApprox; i++)
	{
		var p0=c.plusNew(new TwoDGeometry.Vector(r*Math.cos(startAngle+i*stepAngleApprox), r*Math.sin(startAngle+i*stepAngleApprox)));
		var p1=c.plusNew(new TwoDGeometry.Vector(r*Math.cos(startAngle+(i+1)*stepAngleApprox), r*Math.sin(startAngle+(i+1)*stepAngleApprox)));
		var tempSection=new TwoDGeometry.Section(p0, p1);
		M2xApprox+=tempSection.getM2x();
	}
	return M2xApprox;
};

//-----------------------------------------------------------------------
TwoDGeometry.CurvedSection.prototype.addCrossSectionPropertiesTo=function(cp)
{
	var r=this.getRadius();
	var a=this.p0;
	var b=this.p1;
	var c=this.getCenter();
	var startAngle=this.getStartAngle();
	var endAngle=this.getEndAngle();
	var nApprox=Math.ceil(Math.abs(endAngle-startAngle)/0.01);
	var stepAngleApprox=(endAngle-startAngle)/nApprox;
	for(var i=0; i<nApprox; i++)
	{
		var p0=c.plusNew(new TwoDGeometry.Vector(r*Math.cos(startAngle+i*stepAngleApprox), r*Math.sin(startAngle+i*stepAngleApprox)));
		var p1=c.plusNew(new TwoDGeometry.Vector(r*Math.cos(startAngle+(i+1)*stepAngleApprox), r*Math.sin(startAngle+(i+1)*stepAngleApprox)));
		var tempSection=new TwoDGeometry.Section(p0, p1);
		tempSection.addCrossSectionPropertiesTo(cp);
	}
};

//=======================
//POLYGON OBJECT	
//=======================	
TwoDGeometry.Polygon=function()
{
	this.vertices=[];
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Polygon.prototype.addVertex=function(v)
//v: node as TwoDGeometry.Vector
{
	this.vertices.push(v);
};

//-----------------------------------------------------------------------
TwoDGeometry.Polygon.prototype.from=function(template)
{
	//console.log("TwoDGeometry.Polygon.from() starts");
	this.vertices=[];
	for(var i=0; i<template.vertices.length; i++)
	{
		this.addVertex(template.vertices[i].copy());
	}
	//console.log("TwoDGeometry.Polygon.from() ends");
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Polygon.prototype.copy=function()
{
	var r=new TwoDGeometry.Polygon();
	r.from(this);
	return r;
};

//-----------------------------------------------------------------------
TwoDGeometry.Polygon.prototype.multiplyThis=function(m)
{
	for(var i=0; i<this.vertices.length; i++)
	{
		this.vertices[i].multiplyThis(m);
	}
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Polygon.prototype.plusThis=function(v)
{
	for(var i=0; i<this.vertices.length; i++)
	{
		this.vertices[i].plusThis(v);
	}
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Polygon.prototype.minusThis=function(v)
{
	for(var i=0; i<this.vertices.length; i++)
	{
		this.vertices[i].minusThis(v);
	}
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Polygon.prototype.rotateThis=function(v)
{
	for(var i=0; i<this.vertices.length; i++)
	{
		this.vertices[i].rotateThis(v);
	}
	return this;
};

//-----------------------------------------------------------------------
TwoDGeometry.Polygon.prototype.getBoundingBox=function()
{
	var b=this.vertices[0].getBoundingBox();
	for(var i=1; i<this.vertices.length; i++)
	{
		b.plusThis(this.vertices[i].getBoundingBox());
	}
	return b;
};

