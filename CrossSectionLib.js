
var TwoDGeometry=
{
	vector: function(x, y)
	{
		this.x=x;
		this.y=y;
		this.getLength2=function()
		{
			return this.x*this.x+this.y*this.y;
		};
		this.getLength=function()
		{
			return Math.sqrt(this.getLength2());
		};
		this.toString=function()
		{
			return "("+this.x+", "+this.y+")";
		};
		this.perpendicular=function()
		{
			return new TwoDGeometry.vector(-this.y, this.x);
		};
		this.unitVector=function()
		{
			var l=this.getLength();
			return new TwoDGeometry.vector(this.x/l, this.y/l);
		};
		this.multiply=function(m)
		{
			return new TwoDGeometry.vector(m*this.x, m*this.y);
		};
		this.plus=function(v)
		{
			return new TwoDGeometry.vector(this.x+v.x, this.y+v.y);
		};
		this.minus=function(v)
		{
			return new TwoDGeometry.vector(this.x-v.x, this.y-v.y);
		};
		this.scalarProduct=function(v)
		{
			return this.x*v.x+this.y*v.y;
		};
		this.vectorProduct=function(v)
		{
			return this.x*v.y-this.y*v.x;
		};
		this.distance=function(v)
		{
			return this.minus(v).getLength();
		};
		this.getAngle=function()
		{
			if(y>=x)
			{
				if(y>=-x)
				{
					return Math.PI/2.0-Math.atan(x/y);
				}
				else
				{
					return Math.PI+Math.atan(y/x);
				}	
			}
			else
			{
				if(y>=-x)
				{
					if(y>=0.0)
					{
						return Math.atan(y/x);
					}
					else
					{
						return 2.0*Math.PI+Math.atan(y/x);
					}	
				}
				else
				{
					return 3.0/2.0*Math.PI-Math.atan(x/y);
				}	
			}
		};
		this.getBoundingBox=function()
		{
			return new TwoDGeometry.boundingBox(this.x, this.y, this.x, this.y);
		};
		return this;
	},
	
	section: function(p0, p1)
	{
		this.p0=p0;
		this.p1=p1;
		this.getLength2=function()
		{
			return this.p0.minus(this.p1).getLength2();
		};
		this.getLength=function()
		{
			return this.p0.minus(this.p1).getLength();
		};
		this.getAngle=function()
		{
			return p1.minus(p0).getAngle();
		};
		this.toString=function()
		{
			return "section {"+this.p0.toString()+", "+this.p1.toString()+"}";
		};
		//this.plus=function(v)
		//{
		//	return new TwoDGeometry.vector(this.x+v.x, this.y+v.y);
		//};
		this.getBoundingBox=function()
		{
			return new TwoDGeometry.boundingBox(this.p0.x, this.p0.y, this.p1.x, this.p1.y);
		}
		return this;
	},
	
	arc: function(p0, p1, w)
	{
		TwoDGeometry.section.call(this, p0, p1);
		this.w=w;
		this.getRadius=function()
		{
			return Math.abs(this.w/2.0+this.getLength2()/8.0/this.w);
		};
		this.getCenter=function()
		{
			var m=this.p0.plus(this.p1).multiply(0.5); //vector
			var pu=this.p1.minus(this.p0).perpendicular().unitVector();
			var r=this.getRadius();
			var f=w>0?w-r:w+r;
			return m.plus(pu.multiply(f));
		};
		this.getStartPerpendicularAngle=function()
		{
			var alpha0=this.getAngle()+Math.PI/2.0+2*Math.atan(2*this.w/this.getLength());
			var alpha1=this.getAngle()+Math.PI/2.0-2*Math.atan(2*this.w/this.getLength());
			return alpha0>=0?alpha0:(alpha0+2*Math.PI);
		};
		this.getEndPerpendicularAngle=function()
		{
			var alpha0=this.getAngle()+Math.PI/2.0+2*Math.atan(2*this.w/this.getLength());
			var alpha1=this.getAngle()+Math.PI/2.0-2*Math.atan(2*this.w/this.getLength());
			return alpha0>=0?alpha1:(alpha1+2*Math.PI);
		};
		this.getCentralAngle=function()
		{
			return -4*Math.atan(2*this.w/this.getLength());
		}
		this.r1sin1=function()
		{
			var xA=this.p0.x;
			var yA=this.p0.y;
			var xB=this.p1.x;
			var yB=this.p1.y;
			var C=this.getCenter();
			var xC=C.x;
			var yC=C.y;
			return xA-xB;
		}
		//this.getM0x=function()
		//{
		//	var r=this.getRadius();
		//	var a=this.p0;
		//	var b=this.p1;
		//	var c=this.getCenter();
		//	document.writeln(c.toString()+"<br/>");
		//	return r*r*(b.minus(c).getAngle()-a.minus(c).getAngle())/2.0+(a.x*a.y-a.y*c.x+a.x*c.y-b.x*b.y+b.y*c.x-b.x*c.y)/2.0;
		//};
		return this;
	},
	
	boundingBox: function(x1, y1, x2, y2)
	{
		this.minX=x1<x2?x1:x2;
		this.minY=y1<y2?y1:y2;
		this.maxX=x1<x2?x2:x1;
		this.maxY=y1<y2?y2:y1;
		this.toString=function()
		{
			return "[("+this.minX+", "+this.minY+"), ("+this.maxX+", "+this.maxY+")]";
		};
		this.add=function(v)
		{
			return new TwoDGeometry.boundingBox(Math.min(this.minX, v.minX), Math.min(this.minY, v.minY), Math.max(this.maxX, v.maxX), Math.max(this.maxY, v.maxY));
		};
		this.getWidth=function()
		{
			return this.maxX-this.minX;
		};
		this.getHeight=function()
		{
			return this.maxY-this.minY;
		};
		this.extendBy=function(v)
		{
			this.minX=v.minX<this.minX?v.minX:this.minX;
			this.minY=v.minY<this.minY?v.minY:this.minY;
			this.maxX=v.maxX>this.maxX?v.maxX:this.maxX;
			this.maxY=v.maxY>this.maxY?v.maxY:this.maxY;
			return this;
		};
		return this;
	}
	
};

TwoDGeometry.section.prototype.getM0x=function()
{
	//return 0;
	return (this.p0.x-this.p1.x)*(this.p1.y+this.p0.y)/2.0;
};
TwoDGeometry.section.prototype.getM0x.getM1x=function()
{
	return (this.p0.x-this.p1.x)*(this.p0.y*this.p0.y+this.p0.y*this.p1.y+this.p1.y*this.p1.y)/6.0;
};
TwoDGeometry.section.prototype.getM0x.getM2x=function()
{
	return (this.p0.x-this.p1.x)*(this.p0.y*this.p0.y*this.p0.y+this.p0.y*this.p0.y*this.p1.y+this.p0.y*this.p1.y*this.p1.y+this.p1.y*this.p1.y*this.p1.y)/12.0;
};

TwoDGeometry.arc.prototype.getM0x=function()
{
	var r=this.getRadius();
	var a=this.p0;
	var b=this.p1;
	var c=this.getCenter();
	document.writeln("a: "+a.toString()+"<br/>");
	document.writeln("b: "+b.toString()+"<br/>");
	document.writeln("center: "+c.toString()+"<br/>");
	document.writeln("radius: "+r+"<br/>");
	document.writeln("angle A: "+a.minus(c).getAngle()/Math.PI*180+"<br/>");
	document.writeln("angle A: "+this.getStartPerpendicularAngle()/Math.PI*180+"<br/>");
	document.writeln("angle B: "+b.minus(c).getAngle()/Math.PI*180+"<br/>");
	document.writeln("angle B: "+this.getEndPerpendicularAngle()/Math.PI*180+"<br/>");
	document.writeln("central angle: "+this.getCentralAngle()/Math.PI*180+"<br/>");
	//return 0;
	return r*r*this.getCentralAngle()/2.0+(a.y+c.y)*(a.x-c.x)/2.0-(b.y+c.y)*(b.x-c.x)/2.0;
};

var CrossSectionLib=
{
	//contour point with radius at the pont
	primerVertex: function(x, y, r)
	{
		TwoDGeometry.vector.call(this, x, y);
		this.r=r;
		this.toString=function()
		{
			return "conturVertex "+this.x+", "+this.y+", "+this.r;
		};
		return this;
	},
	
	primerPolygon: function()
	{
		this.vertices=[];
		this.addVertex=function(x, y, r)
		{
			this.vertices[this.vertices.length]=new CrossSectionLib.primerVertex(x, y, r);
		};
		this.getArea=function()
		{
			var A=0;
			var j;
			for(var i=0; i<this.vertices.length; i++)
			{
				j=i+1<this.vertices.length?i+1:0;
				A+=(this.vertices[i].x-this.vertices[j].x)*(this.vertices[i].y+this.vertices[j].y)/2;
			}
			return A;
		};
		this.getBoundingBox=function()
		{
			var b=this.vertices[0].getBoundingBox();
			for(var i=1; i<this.vertices.length; i++)
			{
				b.extendBy(this.vertices[i].getBoundingBox());
			}
			return b;
		};
		this.getSVGObject=function()
		{
			var points="";
			for(var i=0; i<this.vertices.length; i++)
			{
				points+=this.vertices[i].x+","+this.vertices[i].y+" ";
			}
			var x=document.createElementNS("http://www.w3.org/2000/svg","polygon");
			x.setAttribute("points", points);
			//x.setAttribute("style", "fill: none; stroke: red; stroke-width: 1px;"); 
			x.setAttribute("stroke", "red");
			x.setAttribute("stroke-width", "1");
			x.setAttribute("fill", "none");
			return x;
		};
		return this;
	},
	
	primerContour: function()
	{
		this.polygons=[];
		this.getPolygon=function(i)
		{
			if(this.polygons[i]==undefined) this.polygons[i]=new CrossSectionLib.primerPolygon();
			return this.polygons[i];
		}
		this.getBoundingBox=function()
		{
			var b=this.polygons[0].vertices[0].getBoundingBox();
			for(var i=1; i<this.polygons.length; i++)
			{
				b.extendBy(this.polygons[i].getBoundingBox());
			}
			return b;
		};
		this.getSVGObject=function()
		{
			var b=this.getBoundingBox();
			var graphWidth=b.getWidth()*10;
			var graphHeight=b.getHeight()*10;
			var g=document.createElementNS("http://www.w3.org/2000/svg","svg");
			g.setAttribute("width", graphWidth);
			g.setAttribute("height", graphHeight);
			g.setAttribute("viewBox", ""+3*b.minX+" "+3*b.minY+" "+3*b.getWidth()+" "+3*b.getHeight());
			for(var i=0; i<this.polygons.length; i++)
			{
				g.appendChild(this.polygons[i].getSVGObject());
			}
			return g;
		};
	},
	
	//processed contour point with 1/radius of the following section
	secunderVertex: function(x, y, w)
	{
		TwoDGeometry.vector.call(this, x, y);
		this.w=w; //előző szakaszhoz tartozó húrmagasság
		this.toString=function()
		{
			return "secunderVertex "+this.x+", "+this.y+", "+this.w;
		};
		return this;
	},
	
	secunderPolygon: function(primer)
	{
		this.vertices=[];
		for(var i=0; i<primer.vertices.length; i++)
		{
			var actual=primer.vertices[i];
			if(actual.r==0)
			{
				this.vertices[this.vertices.length]=new CrossSectionLib.secunderVertex(actual.x, actual.y, 0); 
			}
			else
			{
				var next=primer.vertices[i<primer.vertices.length-1?i+1:0];
				var previous=primer.vertices[i>0?i-1:primer.vertices.length-1];
				var a=new TwoDGeometry.vector(next.x-actual.x, next.y-actual.y);
				var b=new TwoDGeometry.vector(previous.x-actual.x, previous.y-actual.y);
				var c=new TwoDGeometry.vector(actual.x, actual.y);
				var au=a.unitVector();
				var bu=b.unitVector();
				var sign=bu.vectorProduct(au)>0?1:-1;
				var factor=au.plus(bu).getLength()/au.minus(bu).getLength()*actual.r;
				var pa=c.plus(au.multiply(factor));
				var pb=c.plus(bu.multiply(factor));
				var L=pb.distance(pa); //húr hossza
				var w=sign*actual.r*(1-L/factor/2.0);
				this.vertices[this.vertices.length]=new CrossSectionLib.secunderVertex(pb.x, pb.y, 0);
				this.vertices[this.vertices.length]=new CrossSectionLib.secunderVertex(pa.x, pa.y, w);
				//L: a levágás (húr) hossza
				//r: lekerekítési sugár
				//w: körív legtávolabbi pontjának távolsága a húrtól
				//w=r-r*L/fact/2;
				//w=r-r^2/sqrt(r^2+factor^2);
				//w=r-Math.sqrt(r^2-L^2/4.0);
				//r=w/2.0+L^2/8.0/w;
			}
		}
		this.getRoughArea=function()
		{
			var A=0;
			var j;
			for(var i=0; i<this.vertices.length; i++)
			{
				j=i+1<this.vertices.length?i+1:0;
				A+=(this.vertices[i].x-this.vertices[j].x)*(this.vertices[i].y+this.vertices[j].y)/2;
			}
			return A;
		};
		this.getSection=function(i)
		{
			var a=i;
			var b=i+1<this.vertices.length?i+1:0;
			if(this.vertices[b].w==0)
			{
				return new TwoDGeometry.section(this.vertices[a], this.vertices[b]);
			}
			else
			{
				return new TwoDGeometry.arc(this.vertices[a], this.vertices[b], this.vertices[b].w);
			}
		}
		this.getM0x=function()
		{
			var sum=0;
			for(var i=0; i<this.vertices.length; i++)
			{
				sum+=this.getSection(i).getM0x();
			}
			return sum;
		}
		this.getBoundingBox=function()
		{
			var b=this.vertices[0].getBoundingBox();
			for(var i=1; i<this.vertices.length; i++)
			{
				b.extendBy(this.getSection(i).getBoundingBox());
			}
			return b;
		};
		this.getSVGObject=function()
		{
			var points="";
			for(var i=0; i<this.vertices.length; i++)
			{
				points+=this.vertices[i].x+","+this.vertices[i].y+" ";
			}
			var x=document.createElementNS("http://www.w3.org/2000/svg","polygon");
			x.setAttribute("points", points); 
			x.setAttribute("stroke", "green");
			x.setAttribute("stroke-width", "1");
			x.setAttribute("fill", "none");
			return x;
		};
		this.getSVGdString=function()
		{
			//var c=this.getRoughArea()>0?1:0;
			var d="";
			for(var i=0; i<this.vertices.length; i++)
			{
				if(i==0)
				{
					d+="M "+this.vertices[i].x+","+this.vertices[i].y+" ";
				}
				else
				{
					if(this.vertices[i].w==0)
					{
						d+="L "+this.vertices[i].x+","+this.vertices[i].y+" ";
					}
					else
					{
						var w=Math.abs(this.vertices[i].w);
						var L2=this.vertices[i].minus(this.vertices[i-1]).getLength2();
						var r=w/2.0+L2/8.0/w;
						var c=this.vertices[i].w>0?0:1;
						d+="A "+r+", "+r+" 0 0, "+c+" "+this.vertices[i].x+","+this.vertices[i].y+" ";
					}
				}
			}
			d+="Z ";
			return d;
		};
		return this;
	},
	
	secunderContour: function(primer)
	{
		this.polygons=[];
		for(var i=0; i<primer.polygons.length; i++)
		{
			this.polygons[i]=new CrossSectionLib.secunderPolygon(primer.polygons[i]);
		}
		this.getM0x=function()
		{
			var sum=0;
			for(var i=0; i<this.polygons.length; i++)
			{
				sum+=this.polygons[i].getM0x();
			}
			return sum;
		}				
		this.getBoundingBox=function()
		{
			var b=new TwoDGeometry.boundingBox(this.polygons[0].vertices[0].x, this.polygons[0].vertices[0].y, this.polygons[0].vertices[0].x, this.polygons[0].vertices[0].y);
			for(var i=0; i<this.polygons.length; i++)
			{
				b.extendBy(this.polygons[i].getBoundingBox());
			}
			return b;
		};
		this.getSVGObject=function()
		{
			var b=this.getBoundingBox();
			var graphWidth=b.getWidth()*10;
			var graphHeight=b.getHeight()*10;
			//var g=document.createElementNS("http://www.w3.org/2000/svg","svg");
			//g.setAttribute("width", graphWidth);
			//g.setAttribute("height", graphHeight);
			//g.setAttribute("viewBox", ""+3*b.minX+" "+3*b.minY+" "+3*b.getWidth()+" "+3*b.getHeight());
			var dString="";
			for(var i=0; i<this.polygons.length; i++)
			{
				dString+=this.polygons[i].getSVGdString();
			}
			var p=document.createElementNS("http://www.w3.org/2000/svg","path");
			p.setAttribute("d", dString);
			p.setAttribute("stroke", "black");
			p.setAttribute("stroke-width", "0.3");
			p.setAttribute("fill", "gray");
			//g.appendChild(p);
			return p;
		};
		return this;
	},
	
	arbitrarySection: function(c)
	//c: CrossSectionLib.primerContour
	{
		this.contour=new CrossSectionLib.secunderContour(c);
		return this;
	},
	
	arbitraryParallelFlangeH: function(h, b, f, w, r)
	{
		var c=new CrossSectionLib.primerContour();
		c.getPolygon(0).addVertex(b/2, -h/2, 0);
		c.getPolygon(0).addVertex(b/2, -h/2+f, 0);
		c.getPolygon(0).addVertex(w/2, -h/2+f, r);
		c.getPolygon(0).addVertex(w/2, h/2-f, r);
		c.getPolygon(0).addVertex(b/2, h/2-f, 0);
		c.getPolygon(0).addVertex(b/2, h/2, 0);
		c.getPolygon(0).addVertex(-b/2, h/2, 0);
		c.getPolygon(0).addVertex(-b/2, h/2-f, 0);
		c.getPolygon(0).addVertex(-w/2, h/2-f, r);
		c.getPolygon(0).addVertex(-w/2, -h/2+f, r);
		c.getPolygon(0).addVertex(-b/2, -h/2+f, 0);
		c.getPolygon(0).addVertex(-b/2, -h/2, 0);
		this.contour=new CrossSectionLib.secunderContour(c);
		return this;
	},
	
	arbitraryHollowRectangle: function(h, b, t, ro, ri)
	{
		var c=new CrossSectionLib.primerContour();
		c.getPolygon(0).addVertex(b/2, -h/2, ro);
		c.getPolygon(0).addVertex(b/2, h/2, ro);
		c.getPolygon(0).addVertex(-b/2, h/2, ro);
		c.getPolygon(0).addVertex(-b/2, -h/2, ro);
		c.getPolygon(1).addVertex(b/2-t, -h/2+t, ri);
		c.getPolygon(1).addVertex(-b/2+t, -h/2+t, ri);
		c.getPolygon(1).addVertex(-b/2+t, h/2-t, ri);
		c.getPolygon(1).addVertex(b/2-t, h/2-t, ri);
		this.contour=new CrossSectionLib.secunderContour(c);
		return this;
	},
};

CrossSectionLib.arbitrarySection.prototype.getSVGFigure=function(scale)
{
	var b=this.contour.getBoundingBox();
	var graphWidth=b.getWidth()*scale;
	var graphHeight=b.getHeight()*scale;
	var g=document.createElementNS("http://www.w3.org/2000/svg","svg");
	g.setAttribute("width", graphWidth);
	g.setAttribute("height", graphHeight);
	g.setAttribute("viewBox", ""+b.minX+" "+b.minY+" "+b.getWidth()+" "+b.getHeight());
	g.appendChild(this.contour.getSVGObject());
	return g;
};

CrossSectionLib.arbitraryParallelFlangeH.prototype.getSVGFigure=CrossSectionLib.arbitrarySection.prototype.getSVGFigure;
CrossSectionLib.arbitraryHollowRectangle.prototype.getSVGFigure=CrossSectionLib.arbitrarySection.prototype.getSVGFigure;