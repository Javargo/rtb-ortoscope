//****************************************
//DXF LIBRARY
//****************************************
//Copyright: Major, Balazs
//E-mail: majorstructures@gmail.com
//****************************************
//Change history
//2021-02-22	Object names capitalized; DxfDocument.buildFromString() added
//2020-01-07	Object methods moved to the prototype
//2019-12-29	TwoDGeometry naming convention used

//****************************************
//Todo

//****************************************
//Dependencies
//	TwoDGeometry.js

//****************************************

//===============================================
// DxfGroup
//===============================================
function DxfGroup(c, v)
{
	this.code=parseInt(c);
	this.value=v;
	this.toString=function()
	{
		return String(c)+" : "+v;
	};
	return this;
};

//===============================================
// DxfDocument
//===============================================

function DxfDocument(text)
//text: String containing the DXF file content
{
	this.header=new DxfHeaderSection(this);
	this.entities=new DxfEntitiesSection(this);
	this.blocks=new DxfBlocksSection(this);
	this.numberOfUnprocessedGroups=0;
	if(text!=undefined)
	{
		this.buildFromString(text);
	}
	return this;
}

//------------------------------------------------

DxfDocument.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 2:
			if(g.value=="HEADER")
			{
				return this.header;
			}
			if(g.value=="BLOCKS")
			{
				return this.blocks;
			}
			if(g.value=="ENTITIES")
			{
				return this.entities;
			}
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfDocument.prototype.getBoundingBox=function()
{
	if(this.entities.objects.length>0)
	{
		b=this.entities.objects[0].getBoundingBox();
		for(let i=1; i<this.entities.objects.length; i++)
		{
			b.plusThis(this.entities.objects[i].getBoundingBox());
		}
		return b;
	}
	return null;
};

//------------------------------------------------

DxfDocument.prototype.render=function(c, view)
{		
	c.fillStyle = "blue";
	c.translate(view.x, view.y);
	c.scale(view.scale, -view.scale);
	c.lineWidth=0.5/view.scale;
	let b=this.getBoundingBox();
	if(this.entities.objects.length>0)
	{
		for(let i=0; i<this.entities.objects.length; i++)
		{
			this.entities.objects[i].render(c, view);
		}
	}
};

//------------------------------------------------------------------

DxfDocument.prototype.clear=function()
{
	this.header.clear();
	this.entities.clear();
	this.blocks.clear();
	return this;
}

//------------------------------------------------------------------

DxfDocument.prototype.buildFromString=function(str)
{
	let currentObject=this;
	let lines=str.split(String.fromCharCode(10));
	let codeStr;
	let valueStr;
	let group;
	while(lines.length>1)
	{
		codeStr=lines.shift().replace(String.fromCharCode(13), "");
		valueStr=lines.shift().replace(String.fromCharCode(13), "");
		group=new DxfGroup(codeStr, valueStr);
		currentObject=currentObject.processGroup(group);
	}
	return this;
}

//------------------------------------------------

DxfDocument.prototype.toString=function()
{
	let str="DXF Document\n";
	str+="  number of unprocessed groups = "+this.numberOfUnprocessedGroups+"\n";
	str+=this.header.toString();
	str+=this.entities.toString();
	return str;
};

//===============================================
// DxfHeaderSection
//===============================================

function DxfHeaderSection(p)
{
	this.parent=p;
	this.objects=[];
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfHeaderSection.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 0:
			if(g.value=="ENDSEC")
			{
				return this.parent;
			}
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfHeaderSection.prototype.clear=function()
{
	this.objects=[];
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfHeaderSection.prototype.toString=function()
{
	let str="  Header section\n";
	str+="    number of unprocessed groups = "+this.numberOfUnprocessedGroups+"\n";
	return str;
};

//===============================================
// DxfBlocksSection
//===============================================

function DxfBlocksSection(p)
{
	this.parent=p;
	this.objects=[];
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfBlocksSection.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 0:
			if(g.value=="BLOCK")
			{
				let b=new DxfBlock(this);
				this.objects.push(b);
				return b;
			}
			if(g.value=="ENDSEC")
			{
				return this.parent;
			}
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfBlocksSection.prototype.clear=function()
{
	this.objects=[];
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfBlocksSection.prototype.toString=function()
{
	let str="  Header section\n";
	str+="    number of unprocessed groups = "+this.numberOfUnprocessedGroups+"\n";
	return str;
};

//===============================================
// DxfEntitiesSection
//===============================================

function DxfEntitiesSection(p)
{
	this.parent=p;
	this.objects=[];
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfEntitiesSection.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 0:
			if(g.value=="ENDSEC")
			{
				return this.parent;
			}
			if(g.value=="LINE")
			{
				let x=new DxfLine(this);
				this.objects.push(x);
				return x;
			}
			if(g.value=="POINT")
			{
				let x=new DxfPoint(this);
				this.objects.push(x);
				return x;
			}
			if(g.value=="CIRCLE")
			{
				let x=new DxfCircle(this);
				this.objects.push(x);
				return x;
			}
			if(g.value=="ARC")
			{
				let x=new DxfArc(this);
				this.objects.push(x);
				return x;					
			}
			if(g.value=="TEXT")
			{
				let x=new DxfText(this);
				this.objects.push(x);
				return x;
			}
			if(g.value=="INSERT")
			{
				let x=new DxfInsert(this);
				this.objects.push(x);
				return x;
			}
			return this;
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfEntitiesSection.prototype.clear=function()
{
	this.objects=[];
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfEntitiesSection.prototype.toString=function()
{
	let str="  Entities section\n";
	str+="    number of unprocessed groups = "+this.numberOfUnprocessedGroups+"\n";
	str+="    number of objects = "+this.objects.length+"\n";
	for(let i=0; i<this.objects.length; i++)
	{
		str+=this.objects[i].toString();
	}
	return str;
};

//===============================================
// DxfUnimplementedEntity
//===============================================

function DxfUnimplementedEntity(p)
{
	this.parent=p;
	this.layer="";
	this.handle="";
	this.type="Unimplemented";
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfUnimplementedEntity.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 0:
			switch(g.value)
			{
				case "ATTRIB":
					return this;;
				case "VERTEX":
					return this;
				case "SEQEND":
					return this;
				default:
					return this.parent.processGroup(g); //ez itt átgondolandó. Ha ilyen van, az tulajdonképpen hiba
			}
			//return this.parent.processGroup(g);
		case 5:
			this.handle=g.value;
			return this;
		case 8:
			this.layer=g.value;
			return this;	
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------
	
DxfUnimplementedEntity.prototype.render=function(c, view)
{
};

//===============================================
// DxfLine
//===============================================

function DxfLine(p)
{
	this.parent=p;
	this.layer="";
	this.handle="";
	this.type="LINE";
	this.x1=Math.NaN;
	this.y1=Math.NaN;
	this.x2=Math.NaN;
	this.y2=Math.NaN;
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfLine.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 0:
			return this.parent.processGroup(g);
		case 5:
			this.handle=g.value;
			return this;
		case 8:
			this.layer=g.value;
			return this;	
		case 10:
			this.x1=parseFloat(g.value);
			return this;
		case 11:
			this.x2=parseFloat(g.value);
			return this;
		case 20:
			this.y1=parseFloat(g.value);
			return this;
		case 21:
			this.y2=parseFloat(g.value);
			return this;
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfLine.prototype.render=function(c, view)
{
	c.beginPath();
	c.strokeStyle = "black";
	c.moveTo(this.x1, this.y1);
	c.lineTo(this.x2, this.y2);
	c.closePath();
	c.stroke();
};

//------------------------------------------------

DxfLine.prototype.getBoundingBox=function()
{
	return new TwoDGeometry.BoundingBox(new TwoDGeometry.Vector(this.x1, this.y1), new TwoDGeometry.Vector(this.x2, this.y2));
};

//------------------------------------------------

DxfLine.prototype.getGeometryRepresentation=function()
{
	return new TwoDGeometry.Section(new TwoDGeometry.Vector(this.x1, this.y1), new TwoDGeometry.Vector(this.x2, this.y2));
};

//------------------------------------------------

DxfLine.prototype.toString=function()
{
	let str="    Line\n";
	str+="      number of unprocessed groups = "+this.numberOfUnprocessedGroups+"\n";
	str+="      layer = "+this.layer+"\n";
	str+="      x1 = "+this.x1+"\n";
	str+="      y1 = "+this.y1+"\n";
	str+="      x2 = "+this.x2+"\n";
	str+="      y2 = "+this.y2+"\n";
	return str;
};

//===============================================
// DxfPoint
//===============================================

function DxfPoint(p)
{
	this.parent=p;
	this.layer="";
	this.handle="";
	this.type="POINT";
	this.x=Math.NaN;
	this.y=Math.NaN;
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfPoint.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 0:
			return this.parent.processGroup(g);
		case 5:
			this.handle=g.value;
			return this;
		case 8:
			this.layer=g.value;
			return this;	
		case 10:
			this.x=parseFloat(g.value);
			return this;
		case 20:
			this.y=parseFloat(g.value);
			return this;
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfPoint.prototype.getBoundingBox=function()
{
	return new TwoDGeometry.BoundingBox(new TwoDGeometry.Vector(this.x, this.y));
};

//------------------------------------------------

DxfPoint.prototype.getGeometryRepresentation=function()
{
	return new TwoDGeometry.Vector(this.x1, this.y1);
};

//------------------------------------------------

DxfPoint.prototype.render=function(c, view)
{
	c.beginPath();
	c.strokeStyle = "red";
	c.moveTo(this.x-2/view.scale, this.y-2/view.scale);
	c.lineTo(this.x+2/view.scale, this.y+2/view.scale);
	c.moveTo(this.x+2/view.scale, this.y-2/view.scale);
	c.lineTo(this.x-2/view.scale, this.y+2/view.scale);
	c.stroke();
};

//------------------------------------------------

DxfPoint.prototype.toString=function()
{
	let str="    Line\n";
	str+="      number of unprocessed groups = "+this.numberOfUnprocessedGroups+"\n";
	str+="      layer = "+this.layer+"\n";
	str+="      x = "+this.x+"\n";
	str+="      y = "+this.y+"\n";
	return str;
};

//===============================================
// DxfCircle
//===============================================

function DxfCircle(p)
{
	this.parent=p;
	this.layer="";
	this.handle="";
	this.type="CIRCLE";
	this.x=Math.NaN;
	this.y=Math.NaN;
	this.radius=Math.NaN;
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfCircle.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 0:
			return this.parent.processGroup(g);
		case 5:
			this.handle=g.value;
			return this;
		case 8:
			this.layer=g.value;
			return this;	
		case 10:
			this.x=parseFloat(g.value);
			return this;
		case 20:
			this.y=parseFloat(g.value);
			return this;
		case 40:
			this.radius=parseFloat(g.value);
			return this;
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfCircle.prototype.render=function(c, view)
{
	c.beginPath();
	c.strokeStyle = "black";
	c.arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
	c.stroke();
};

//------------------------------------------------

DxfCircle.prototype.getBoundingBox=function()
{
	return new TwoDGeometry.BoundingBox(new TwoDGeometry.Vector(this.x-this.radius, this.y-this.radius), new TwoDGeometry.Vector(this.x+this.radius, this.y+this.radius));
};

//------------------------------------------------

DxfCircle.prototype.getGeometryRepresentation=function()
{
	return new TwoDGeometry.Arc(new TwoDGeometry.Vector(this.x, this.y), this.radius, 0, 2*Math.PI);
};

//------------------------------------------------

DxfCircle.prototype.toString=function()
{
	let str="    Circle\n";
	str+="      number of unprocessed groups = "+this.numberOfUnprocessedGroups+"\n";
	str+="      layer = "+this.layer+"\n";
	str+="      x = "+this.x+"\n";
	str+="      y = "+this.y+"\n";
	str+="      radius = "+this.radius+"\n";
	return str;
};

//===============================================
// DxfArc
//===============================================

function DxfArc(p)
{
	this.parent=p;
	this.layer="";
	this.handle="";
	this.type="ARC";
	this.x=Math.NaN;
	this.y=Math.NaN;
	this.radius=Math.NaN;
	this.startAngle=Math.NaN;
	this.endAngle=Math.NaN;
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfArc.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 0:
			return this.parent.processGroup(g);
		case 5:
			this.handle=g.value;
			return this;
		case 8:
			this.layer=g.value;
			return this;	
		case 10:
			this.x=parseFloat(g.value);
			return this;
		case 20:
			this.y=parseFloat(g.value);
			return this;
		case 40:
			this.radius=parseFloat(g.value);
			return this;
		case 50:
			this.startAngle=parseFloat(g.value);
			return this;
		case 51:
			this.endAngle=parseFloat(g.value);
			return this;
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfArc.prototype.render=function(c, view)
{
	c.beginPath();
	c.strokeStyle = "black";
	c.moveTo(this.x+Math.cos(this.endAngle/180*Math.PI)*this.radius, this.y+Math.sin(this.endAngle/180*Math.PI)*this.radius);
	c.arc(this.x, this.y, this.radius, this.endAngle/180*Math.PI, this.startAngle/180*Math.PI, true);
	c.stroke();
};

//------------------------------------------------

DxfArc.prototype.getBoundingBox=function()
{
	//Ez javítandó a kezdő és befejező szög függvényében
	return new TwoDGeometry.BoundingBox(new TwoDGeometry.Vector(this.x-this.radius, this.y-this.radius), new TwoDGeometry.Vector(this.x+this.radius, this.y+this.radius));
};

//------------------------------------------------
//ez itt még nem jó, a szögek miatt!!!!
DxfArc.prototype.getGeometryRepresentation=function()
{
	return new TwoDGeometry.Arc(new TwoDGeometry.Vector(this.x, this.y), this.radius, this.startAngle/180*Math.PI, this.endAngle/180*Math.PI-this.startAngle/180*Math.PI);
};

//------------------------------------------------

DxfArc.prototype.toString=function()
{
	let str="    Arc\n";
	str+="      number of unprocessed groups = "+this.numberOfUnprocessedGroups+"\n";
	str+="      layer = "+this.layer+"\n";
	str+="      x = "+this.x+"\n";
	str+="      y = "+this.y+"\n";
	str+="      radius = "+this.radius+"\n";
	str+="      startAngle = "+this.startAngle+"\n";
	str+="      endAngle = "+this.endAngle+"\n";
	return str;
};

//===============================================
// DxfText
//===============================================

function DxfText(p)
{
	this.parent=p;
	this.layer="";
	this.handle="";
	this.type="TEXT";
	this.text="";
	this.x=Math.NaN;
	this.y=Math.NaN;
	this.height=1;
	this.rotation=0;
	this.justification=0;
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfText.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 0:
			return this.parent.processGroup(g);
		case 1:
			this.text=g.value;
			return this;
		case 5:
			this.handle=g.value;
			return this;
		case 8:
			this.layer=g.value;
			return this;	
		case 10:
			this.x=parseFloat(g.value);
			return this;
		case 20:
			this.y=parseFloat(g.value);
			return this;
		case 40:
			this.height=parseFloat(g.value);
			return this;
		case 50:
			this.rotation=parseFloat(g.value);
			return this;
		case 72:
			this.justification=parseInt(g.value);
			return this;
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfText.prototype.render=function(c, view)
{
	c.save();
	c.translate(this.x, this.y);
	c.scale(1, -1);
	//c.font=(this.height*3.95).toFixed(0)+"px sans-serif";
	c.font=this.height.toFixed(0)+"px sans-serif";
	c.textBaseline="alphabetic";
	//c.fillText(this.text, this.x, this.y);
	c.fillText(this.text, 0, 0);
	c.restore();
};

//------------------------------------------------

DxfText.prototype.getBoundingBox=function()
{
	//javítandó!!!
	return new TwoDGeometry.BoundingBox(new TwoDGeometry.Vector(this.x, this.y), new TwoDGeometry.Vector(this.x+0.5*this.height*this.text.length, this.y+this.height));
};

//------------------------------------------------

DxfText.prototype.toString=function()
{
	let str="    Text\n";
	str+="      number of unprocessed groups = "+this.numberOfUnprocessedGroups+"\n";
	str+="      layer = "+this.layer+"\n";
	str+="      text = "+this.text+"\n";
	str+="      x = "+this.x+"\n";
	str+="      y = "+this.y+"\n";
	str+="      rotation = "+this.rotation+"\n";
	str+="      height = "+this.height+"\n";
	str+="      justification = "+this.justification+"\n";
	return str;
};

//===============================================
// DxfAttrib
//===============================================

function DxfAttrib(p)
{
	this.parent=p;
	this.layer="";
	this.handle="";
	this.type="ATTRIB";
	this.name="";
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfAttrib.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 0:
			switch(g.value)
			{
				case "ATTRIB":
					return this.parent.processGroup(g);
				case "SEQEND":
					return this.parent;
				default:
					dump("SEQEND problem\n");
					return this; //ez itt átgondolandó. Ha ilyen van, az tulajdonképpen hiba
			}
		case 2:
			this.name=g.value;
			return this;
		case 5:
			this.handle=g.value;
			return this;
		case 8:
			this.layer=g.value;
			return this;	
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfAttrib.prototype.render=function(c, view)
{
};

//------------------------------------------------

DxfAttrib.prototype.getBoundingBox=function()
{
	//javítandó!!!
	return new TwoDGeometry.BoundingBox(new TwoDGeometry.Vector(this.x, this.y));
};

//===============================================
// DxfInsert
//===============================================

function DxfInsert(p)
{
	this.parent=p;
	this.blockRef=null;
	this.attribs=[];
	this.layer="";
	this.handle="";
	this.type="INSERT";
	this.name="";
	this.x=Math.NaN;
	this.y=Math.NaN;
	this.xScaleFactor=1;
	this.yScaleFactor=1;
	this.rotation=0;
	this.justification=0;
	this.numberOfUnprocessedGroups=0;
	//ATTRIB-ot is implementálni kellene. Lehet, hogy a SEQEND hibát okoz?
	return this;
};

//------------------------------------------------

DxfInsert.prototype.processGroup=function(g)
{
	switch(g.code)
	{
		case 0:
			switch(g.value)
			{
				case "ATTRIB":
					let a=new DxfAttrib(this);
					this.attribs.push(a);
					return a;
				case "SEQEND":
					return this;
				default:
					return this.parent.processGroup(g);
			}
		case 2:
			this.name=g.value;
			let d=this.parent;
			while((d instanceof DxfDocument)==false)
			{
				d=d.parent;
			}
			for(let i=0; i<d.blocks.objects.length; i++)
			{
				if(this.name==d.blocks.objects[i].name)
				{
					this.blockRef=d.blocks.objects[i];
					//console.log("Block "+ this.name + " linked\n");
					break;
				}
			}
			if(this.blockRef==null)
			{
				//console.log("Block "+ this.name + " could not be linked\n");
			}
			return this;
		case 5:
			this.handle=g.value;
			return this;
		case 8:
			this.layer=g.value;
			return this;	
		case 10:
			this.x=parseFloat(g.value);
			return this;
		case 20:
			this.y=parseFloat(g.value);
			return this;
		case 41:
			this.xScaleFactor=parseFloat(g.value);
			return this;
		case 42:
			this.yScaleFactor=parseFloat(g.value);
			return this;
		case 50:
			this.rotation=parseFloat(g.value);
			return this;
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfInsert.prototype.render=function(c, view)
{
	if(this.blockRef!=null)
	{
		c.save();
		c.translate(this.x, this.y);
		c.rotate(this.rotation/180*Math.PI);
		c.scale(this.xScaleFactor, this.yScaleFactor);
		for(let i=0; i<this.blockRef.objects.length; i++)
		{
			this.blockRef.objects[i].render(c, view);
		}
		c.restore();
	}
};

//------------------------------------------------

DxfInsert.prototype.getBoundingBox=function()
{
	//javítandó!!!
	return new TwoDGeometry.BoundingBox(new TwoDGeometry.Vector(this.x, this.y));
};

//------------------------------------------------

DxfInsert.prototype.toString=function()
{
	let str="    Insert\n";
	str+="      number of unprocessed groups = "+this.numberOfUnprocessedGroups+"\n";
	str+="      layer = "+this.layer+"\n";
	str+="      name = "+this.name+"\n";
	str+="      x = "+this.x+"\n";
	str+="      y = "+this.y+"\n";
	str+="      xScaleFactor = "+this.xScaleFactor+"\n";
	str+="      yScaleFactor = "+this.yScaleFactor+"\n";
	str+="      rotation = "+this.rotation+"\n";
	return str;
};

//===============================================
// DxfBlock
//===============================================

function DxfBlock(p)
{
	this.parent=p;
	this.layer="";
	this.name="";
	this.handle="";
	this.type="BLOCK";
	this.x=Math.NaN;
	this.y=Math.NaN;
	this.objects=[];
	this.numberOfUnprocessedGroups=0;
	return this;
};

//------------------------------------------------

DxfBlock.prototype.processGroup=function(g)
{
	let x;
	switch(g.code)
	{
		case 0:
			switch(g.value)
			{
				case "ENDBLK":
					return this.parent;
				case "LINE":
					x=new DxfLine(this);
					this.objects.push(x);
					return x;
				case "POINT":
					x=new DxfPoint(this);
					this.objects.push(x);
					return x;
				case "CIRCLE":
					x=new DxfCircle(this);
					this.objects.push(x);
					return x;
				case "ARC":
					x=new DxfArc(this);
					this.objects.push(x);
					return x;					
				case "TEXT":
					x=new DxfText(this);
					this.objects.push(x);
					return x;
				case "INSERT":
					x=new DxfInsert(this);
					this.objects.push(x);
					return x;
				default:
					//return this;
					return new DxfUnimplementedEntity(this);
			};
		case 2:
			if(this.name.length>0) dump("Block name overwriten: "+this.name+" -> "+g.value+"\n");
			this.name=g.value;
			return this;	
		case 5:
			this.handle=g.value;
			return this;
		case 8:
			this.layer=g.value;
			return this;
		case 10:
			this.x1=parseFloat(g.value);
			return this;
		case 20:
			this.y1=parseFloat(g.value);
			return this;
		default:
			this.numberOfUnprocessedGroups++;
			return this;
	}
};

//------------------------------------------------

DxfBlock.prototype.toString=function()
{
	let str="  Block\n";
	str+="    number of unprocessed groups = "+this.numberOfUnprocessedGroups+"\n";
	str+="    number of objects = "+this.objects.length+"\n";
	for(let i=0; i<this.objects.length; i++)
	{
		str+=this.objects[i].toString();
	}
	return str;
};
