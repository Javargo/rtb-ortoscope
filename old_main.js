
var actualDrawing=null;
var canvasControl=null;
var actualRTBData=null;
var actualTrussData=null;
var actualMiddleAxes=null;
var lastOpenedFileName=null;

function mainWindowOnLoad(e)
{
	dump("mainWindowOnLoad starts\n");
	canvasControl=document.getElementById('MyCanvas');
	window.addEventListener("resize", handleResizeEvent);
	handleResizeEvent();
	dump("mainWindowOnLoad ends\n");
};

var panEventStarted=false;
var mouseDownX;
var mouseDownY;

function handleResizeEvent(e)
{
	//var box1=e.target.document.getElementById("box1");
	var box1=document.getElementById("box1");
	canvasControl.width=box1.getBoundingClientRect().width;
	canvasControl.height=box1.getBoundingClientRect().height;
	renderAll();
}

function handleMouseDown(e)
{
	panEventStarted=true;
	mouseDownX=e.clientX;
	mouseDownY=e.clientY;
};

function handleMouseUp(e)
{
	if(panEventStarted==true && actualDrawing!=null)
	{
		var mouseDeltaX=e.clientX-mouseDownX;
		var mouseDeltaY=e.clientY-mouseDownY;
		actualView.pan(mouseDeltaX, mouseDeltaY);
		renderAll();
		//actualDrawing.render(canvasControl.getContext('2d'), actualView);
		
	}
	panEventStarted=false;
};

function handleMouseScroll(e)
{
	//dump("handleMouseScroll starts\n");
	if(actualDrawing!=null)
	{
		var rescaleFactor=(1-e.deltaY/3*0.25);
		//jó lenne a vászon koordinátáit pontosabban meghatározni
		var x=e.clientX-3;
		var y=e.clientY-15;
		//dump("y "+canvasControl.clientTop+"\n");
		actualView.scale*=rescaleFactor;
		actualView.x=x-rescaleFactor*(x-actualView.x);
		actualView.y=y-rescaleFactor*(y-actualView.y);
		renderAll();
		//actualDrawing.render(canvasControl.getContext('2d'), actualView);
	}
	//dump("handleMouseScroll ends\n");
};

function handleMouseMove(e)
{
	var sz=document.getElementById("sz");
	//if(actualDrawing==null)
	//{
	//	sz.value="No drawing loaded";
	//}
	//else
	//{
		sz.value=Number((e.offsetX-actualView.x)/actualView.scale).toPrecision(5)+", "+Number((-e.offsetY+actualView.y)/actualView.scale).toPrecision(5);
	//}
}

//Ez határozza meg hogy hova rajzolódjon az ábra a vásznon
function ViewProperties()
{
	this.x=0;
	this.y=0;
	this.scale=1;
	this.centerDrawingOnCanvas=function(drawing, canvas)
	{
		dump("ViewProperties.centerDrawingOnCanvas starts\n");
		var b=drawing.getBoundingBox();
		var scaleGuessH=canvas.width/b.getWidth();
		var scaleGuessV=canvas.height/b.getHeight();
		this.scale=scaleGuessH<scaleGuessV?scaleGuessH:scaleGuessV;
		this.x=canvas.width/2.0-this.scale*b.getWidth()/2.0-this.scale*b.p0.x;
		this.y=canvas.height/2.0+this.scale*b.getHeight()/2.0+this.scale*b.p0.y;
		dump("ViewProperties.centerDrawingOnCanvas ends\n");
	};
	this.pan=function(dx, dy)
	{
		dump("ViewProperties.pan starts\n");
		this.x+=dx;
		this.y+=dy;
		dump("ViewProperties.pan ends\n");
	};
	return this;
};

var actualView=new ViewProperties();

function renderAll()
{
	var c=canvasControl.getContext('2d');
	c.setTransform(1, 0, 0, 1, 0, 0);
	c.fillStyle = "white";
	c.fillRect(0, 0, c.canvas.width, c.canvas.height);
	if(actualDrawing!=null)
	{
		actualDrawing.render(c, actualView);
	}
	if(actualRTBData!=null)
	{
		actualRTBData.render(c, actualView);
	}
	if(actualTrussData!=null)
	{
		actualTrussData.render(c, actualView);
	}
	if(actualMiddleAxes!=null)
	{
		actualMiddleAxes.render(c, actualView);
	}
}

//****************************
// processDXFFile
//****************************

//ez hívódik meg, miután a felhasználó kiválasztja a fájlt
function processDXFFile(file)
{
	dump("processDXFFile starts\n");
	//var reader = new dxfFileReader(file);
	var doc=new dxfDocument();
	var currentObject=doc;
	var fis = Components.classes["@mozilla.org/network/file-input-stream;1"]
                    .createInstance(Components.interfaces.nsIFileInputStream);
	fis.init(file, -1, -1, 0);
	var lis = fis.QueryInterface(Components.interfaces.nsILineInputStream);
	var cont;
	var lineData={};
	var codeStr;
	var valueStr;
	var g;
	var h; //kisérleti!!
	do
	{
		cont=lis.readLine(lineData);
		codeStr=lineData.value;
		cont=lis.readLine(lineData);
		valueStr=lineData.value;
		g=new dxfGroup(codeStr, valueStr);
		if(g.code==5) h=valueStr;//kísérleti!
		//if(g.code==0) dump("> "+g.value+"\n");
		currentObject=currentObject.processGroup(g);
	}
	while(cont);
	//dump("Last read handle: "+h+"\n");
	actualDrawing=doc;
	actualView.centerDrawingOnCanvas(actualDrawing, canvasControl);
	renderAll();
	//actualDrawing.render(canvasControl.getContext('2d'), actualView);
	//dump("BLOCKS\n");
	//for(var i=0; i<actualDrawing.blocks.objects.length; i++)
	//{
	//	dump("> "+actualDrawing.blocks.objects[i].name+"\n");
	//}
	dump("processDXFFile ends\n");
}


//****************************
// rtbData
//****************************

function rtbData()
{
	this.fileNameTrunk="";
	this.beamPoints=[];
	this.contourPoints=[];
	this.podestLevels=[];
	this.teilung=null;
	this.lowerConcreteLevel=null;
	this.upperConcreteLevel=null;
	this.mirror=false;
	//....................................................................................................
	this.render=function(c, view)
	{
		dump("rtbData.render starts\n");	
		var sign=this.mirror?-1:1;
		//tartó pontok
		c.lineWidth=4/actualView.scale;
		if(this.beamPoints.length>0)
		{
			c.strokeStyle="rgba(255, 0, 0, 0.5)";
			c.fillStyle="rgba(255, 0, 0, 0.5)";
			c.beginPath();
			c.moveTo(sign*this.beamPoints[0].x, this.beamPoints[0].y);
			for(var i=1; i<this.beamPoints.length; i++)
			{
				c.lineTo(sign*this.beamPoints[i].x, this.beamPoints[i].y);
			}
			c.stroke();
			for(var i=0; i<this.beamPoints.length; i++)
			{
				c.beginPath();
				c.arc(sign*this.beamPoints[i].x, this.beamPoints[i].y, 3/actualView.scale, 0, 2*Math.PI, true);
				c.stroke();
				c.save();
				c.translate(sign*this.beamPoints[i].x, this.beamPoints[i].y);
				c.scale(1, -1);
				//c.font=(30/actualView.scale).toFixed(0)+"px sans-serif";
				c.font=("50px sans-serif");
				c.textBaseline="middle";
				//c.fillText("("+i+") "+this.beamPoints[i].type, sign*this.beamPoints[i].x+5/actualView.scale, this.beamPoints[i].y);
				c.fillText("("+i+") "+this.beamPoints[i].type, 5/actualView.scale, 0);
				c.restore();
			}
		}
		
		//beton kontúr
		if(this.contourPoints.length>0)
		{
			c.strokeStyle="none";
			c.fillStyle="rgba(0, 200, 0, 0.5)";
			c.beginPath();
			c.moveTo(sign*this.contourPoints[0].x, this.contourPoints[0].y);
			for(var i=1; i<this.contourPoints.length; i++)
			{
				c.lineTo(sign*this.contourPoints[i].x, this.contourPoints[i].y);
			}
			c.closePath();
			c.fill();
		}
		
		//konzol magasságok
		c.fillStyle="none";
		c.strokeStyle="rgba(127, 127, 255, 0.9)";
		c.lineWidth=1/actualView.scale;
		c.beginPath();
		for(var i=0; i<this.podestLevels.length; i++)
		{
			c.moveTo(sign*25000, this.podestLevels[i]);
			c.lineTo(0, this.podestLevels[i]);
		}
		c.stroke();
		
		//betonnyomás tartomány
		c.fillStyle="none";
		c.strokeStyle="rgba(255, 255, 0, 0.9)";
		c.lineWidth=1/actualView.scale;
		c.beginPath();
		c.moveTo(sign*25000, this.lowerConcreteLevel);
		c.lineTo(0, this.lowerConcreteLevel);
		c.moveTo(sign*25000, this.upperConcreteLevel);
		c.lineTo(0, this.upperConcreteLevel);
		c.stroke();
		dump("rtbData.render ends\n");
	};
	//....................................................................................................
	this.extractFrom=function(drawing)
	{
		var collectedBeamPoints=[];
		//var collectedContourPoints=[];
		var collectedPodestLevels=[];
		var collectedSectionLevels=[];
		//a blokkokban nem keres egyenlőre
		for(var i=0; i<drawing.entities.objects.length; i++)
		{
			var x=drawing.entities.objects[i];
			switch(x.layer.toLowerCase())
			{
				case "traeger":
					if(x.type=="TEXT")
					{
						collectedBeamPoints.push(x);
					}
					break;
				case "beton":
					if(x.type=="POINT")
					{
						
						var point=new TwoDGeometry.vector(Math.abs(x.x), x.y);
						this.contourPoints.push(point);
					}
					break;
				case "podest":
					if(x.type=="POINT")
					{
						this.podestLevels.push(x.y);
					}
					break;
				case "diverse":
					if(x.type=="TEXT")
					{
						if(x.text.startsWith("T="))
						{
							this.teilung=parseInt(x.text.substr(2));
						}
					}
					if(x.type=="POINT")
					{
						collectedSectionLevels.push(x.y);
					}
					break;
				default:
			}
		}
		//hiányposságok kijelzése
		if(collectedBeamPoints.length==0) dump("Warning: No beam points found!\n");
		if(collectedBeamPoints.length>0 && collectedBeamPoints.length<3) dump("Warning: Only "+collectedBeamPoints.length+" beam points found!\n");
		if(this.contourPoints.length==0) dump("Warning: No concrete contour points found!\n");
		if(this.contourPoints.length>0 && this.contourPoints.length<3) dump("Warning: Only "+this.contourPoints.length+" concrete contour points found!\n");
		if(collectedPodestLevels.length==0) dump("Warning: No podest levels found!\n");
		if(collectedSectionLevels.length==0) dump("Warning: No concreting section limits found!\n");
		if(collectedSectionLevels.length==1) dump("Warning: Only one concreting section limits found! (Two required)\n");
		if(collectedSectionLevels.length>2) dump("Warning: Two much concreting section limits found! ("+collectedSectionLevels.length+" instead of two)\n");
		if(this.teilung==null || this.teilung==Math.NaN) dump("Warning: No beam number information (Teilung) found!\n");
		
		//tartó pontok száma
		var n=collectedBeamPoints.length;
		if(n>1)
		{
			//használt pontok nyilvántartása
			var pointUsed=[];
			for(var i=0; i<n; i++)
			{
				pointUsed[i]=false;
			}
			
			//legnagyobb távolság, mint kiinduló érték
			var maxDist2=0;
			for(var j=0; j<n-1; j++)
			{
				for(var i=j+1; i<n; i++)
				{
					var dist2=Math.pow(collectedBeamPoints[i].x-collectedBeamPoints[j].x, 2)+Math.pow(collectedBeamPoints[i].y-collectedBeamPoints[j].y, 2);
					if(dist2>maxDist2)
					{
						maxDist2=dist2;
					}
				}
			}
			//megkeressük a legkisebb távolsághoz tartozó pontokat
			var choosenI=null;
			var choosenJ=null;
			var minDist2=maxDist2;
			for(var j=0; j<n-1; j++)
			{
				for(var i=j+1; i<n; i++)
				{
					var dist2=Math.pow(collectedBeamPoints[i].x-collectedBeamPoints[j].x, 2)+Math.pow(collectedBeamPoints[i].y-collectedBeamPoints[j].y, 2);
					if(dist2<=minDist2)
					{
						minDist2=dist2;
						choosenI=i;
						choosenJ=j;
					}
				}
			}

			//hozzáadom a kiválasztott pontokat a this.beamPoints-hoz
			var x=new TwoDGeometry.vector(Math.abs(collectedBeamPoints[choosenI].x), collectedBeamPoints[choosenI].y);
			x.type=parseInt(collectedBeamPoints[choosenI].text);
			this.beamPoints.push(x);
			pointUsed[choosenI]=true;
			var x=new TwoDGeometry.vector(Math.abs(collectedBeamPoints[choosenJ].x), collectedBeamPoints[choosenJ].y);
			x.type=parseInt(collectedBeamPoints[choosenJ].text);
			this.beamPoints.push(x);
			pointUsed[choosenJ]=true;
			this.mirror=collectedBeamPoints[0].x<0?true:false;
			
			//(n-2)-ször lejátszom, mert még ennyi pontot kell hozzáadni a this.beamPoints-hoz
			for(var j=0; j<n-2; j++)
			{
				var minDist2_s=maxDist2;
				var choosenI_s=null;
				var minDist2_e=maxDist2;
				var choosenI_e=null;
				for(var i=0; i<n; i++)
				{
					if(!pointUsed[i])
					{
						var dist2_s=Math.pow(this.beamPoints[0].x-Math.abs(collectedBeamPoints[i].x), 2)+Math.pow(this.beamPoints[0].y-collectedBeamPoints[i].y, 2);
						if(dist2_s<=minDist2_s)
						{
							minDist2_s=dist2_s;
							choosenI_s=i;
						}
						var dist2_e=Math.pow(this.beamPoints[j+1].x-Math.abs(collectedBeamPoints[i].x), 2)+Math.pow(this.beamPoints[j+1].y-collectedBeamPoints[i].y, 2);
						if(dist2_e<=minDist2_e)
						{
							minDist2_e=dist2_e;
							choosenI_e=i;
						}
					}
				}
				if(minDist2_s<minDist2_e)
				{
					var x=new TwoDGeometry.vector(Math.abs(collectedBeamPoints[choosenI_s].x), collectedBeamPoints[choosenI_s].y);
					x.type=parseInt(collectedBeamPoints[choosenI_s].text);
					this.beamPoints.unshift(x);
					pointUsed[choosenI_s]=true;
				}
				else
				{
					var x=new TwoDGeometry.vector(Math.abs(collectedBeamPoints[choosenI_e].x), collectedBeamPoints[choosenI_e].y);
					x.type=parseInt(collectedBeamPoints[choosenI_e].text);
					this.beamPoints.push(x);
					pointUsed[choosenI_e]=true;
				}
			}
			if(this.beamPoints[0].y>this.beamPoints[this.beamPoints.length-1].y)
			{
				this.beamPoints.reverse();
			}
		}
		
		this.podestLevels.sort(function(a, b){return a - b;});
		collectedSectionLevels.sort(function(a, b){return a - b;});
		this.lowerConcreteLevel=collectedSectionLevels[0];
		this.upperConcreteLevel=collectedSectionLevels[collectedSectionLevels.length-1];
	};
	//....................................................................................................
	this.extractExperimentalFrom=function(drawing)
	{
		//a geometriai pontokat és az egyebeket külön kell szedni,
		//a geometriai végigcsinálni, amit az előzőben,
		//a többi pontot rávetíteni a tartótengelyre
		
		var collectedGeometryPoints=[]; //0...9
		var collectedMarkerPoints=[]; //az összes többi
		var collectedPodestLevels=[];
		var collectedSectionLevels=[];
		//a blokkokban nem keres egyenlőre
		for(var i=0; i<drawing.entities.objects.length; i++)
		{
			var x=drawing.entities.objects[i];
			switch(x.layer.toLowerCase())
			{
				case "traeger":
					if(x.type=="TEXT")
					{
						if(parseInt(x.text)<10)
						{
							collectedGeometryPoints.push(x);
						}
						else
						{
							collectedMarkerPoints.push(x);
						}
					}
					break;
				case "beton":
					if(x.type=="POINT")
					{
						
						var point=new TwoDGeometry.vector(Math.abs(x.x), x.y);
						this.contourPoints.push(point);
					}
					break;
				case "podest":
					if(x.type=="POINT")
					{
						this.podestLevels.push(x.y);
					}
					break;
				case "diverse":
					if(x.type=="TEXT")
					{
						if(x.text.startsWith("T="))
						{
							this.teilung=parseInt(x.text.substr(2));
						}
					}
					if(x.type=="POINT")
					{
						collectedSectionLevels.push(x.y);
					}
					break;
				default:
			}
		}
		//hiányposságok kijelzése
		if(collectedGeometryPoints.length==0) dump("Warning: No beam geometry points found!\n");
		if(collectedGeometryPoints.length>0 && collectedGeometryPoints.length<3) dump("Warning: Only "+collectedGeometryPoints.length+" beam geometry point(s) found!\n");
		if(this.contourPoints.length==0) dump("Warning: No concrete contour points found!\n");
		if(this.contourPoints.length>0 && this.contourPoints.length<3) dump("Warning: Only "+this.contourPoints.length+" concrete contour points found!\n");
		if(collectedPodestLevels.length==0) dump("Warning: No podest levels found!\n");
		if(collectedSectionLevels.length==0) dump("Warning: No concreting section limits found!\n");
		if(collectedSectionLevels.length==1) dump("Warning: Only one concreting section limits found! (Two required)\n");
		if(collectedSectionLevels.length>2) dump("Warning: Two much concreting section limits found! ("+collectedSectionLevels.length+" instead of two)\n");
		if(this.teilung==null || this.teilung==Math.NaN) dump("Warning: No beam number information (Teilung) found!\n");
		
		//tartó pontok száma
		var n=collectedGeometryPoints.length;
		if(n>1)
		{
			//használt pontok nyilvántartása
			var pointUsed=[];
			for(var i=0; i<n; i++)
			{
				pointUsed[i]=false;
			}
			
			//legnagyobb távolság, mint kiinduló érték
			var maxDist2=0;
			for(var j=0; j<n-1; j++)
			{
				for(var i=j+1; i<n; i++)
				{
					var dist2=Math.pow(collectedGeometryPoints[i].x-collectedGeometryPoints[j].x, 2)+Math.pow(collectedGeometryPoints[i].y-collectedGeometryPoints[j].y, 2);
					if(dist2>maxDist2)
					{
						maxDist2=dist2;
					}
				}
			}
			//megkeressük a legkisebb távolsághoz tartozó pontokat
			var choosenI=null;
			var choosenJ=null;
			var minDist2=maxDist2;
			for(var j=0; j<n-1; j++)
			{
				for(var i=j+1; i<n; i++)
				{
					var dist2=Math.pow(collectedGeometryPoints[i].x-collectedGeometryPoints[j].x, 2)+Math.pow(collectedGeometryPoints[i].y-collectedGeometryPoints[j].y, 2);
					if(dist2<=minDist2)
					{
						minDist2=dist2;
						choosenI=i;
						choosenJ=j;
					}
				}
			}

			//hozzáadom a kiválasztott pontokat a this.beamPoints-hoz
			var x=new TwoDGeometry.vector(Math.abs(collectedGeometryPoints[choosenI].x), collectedGeometryPoints[choosenI].y);
			x.type=parseInt(collectedGeometryPoints[choosenI].text);
			this.beamPoints.push(x);
			pointUsed[choosenI]=true;
			var x=new TwoDGeometry.vector(Math.abs(collectedGeometryPoints[choosenJ].x), collectedGeometryPoints[choosenJ].y);
			x.type=parseInt(collectedGeometryPoints[choosenJ].text);
			this.beamPoints.push(x);
			pointUsed[choosenJ]=true;
			this.mirror=collectedGeometryPoints[0].x<0?true:false;
			
			//(n-2)-ször lejátszom, mert még ennyi pontot kell hozzáadni a this.beamPoints-hoz
			for(var j=0; j<n-2; j++)
			{
				var minDist2_s=maxDist2;
				var choosenI_s=null;
				var minDist2_e=maxDist2;
				var choosenI_e=null;
				for(var i=0; i<n; i++)
				{
					if(!pointUsed[i])
					{
						var dist2_s=Math.pow(this.beamPoints[0].x-Math.abs(collectedGeometryPoints[i].x), 2)+Math.pow(this.beamPoints[0].y-collectedGeometryPoints[i].y, 2);
						if(dist2_s<=minDist2_s)
						{
							minDist2_s=dist2_s;
							choosenI_s=i;
						}
						var dist2_e=Math.pow(this.beamPoints[j+1].x-Math.abs(collectedGeometryPoints[i].x), 2)+Math.pow(this.beamPoints[j+1].y-collectedGeometryPoints[i].y, 2);
						if(dist2_e<=minDist2_e)
						{
							minDist2_e=dist2_e;
							choosenI_e=i;
						}
					}
				}
				if(minDist2_s<minDist2_e)
				{
					var x=new TwoDGeometry.vector(Math.abs(collectedGeometryPoints[choosenI_s].x), collectedGeometryPoints[choosenI_s].y);
					x.type=parseInt(collectedGeometryPoints[choosenI_s].text);
					this.beamPoints.unshift(x);
					pointUsed[choosenI_s]=true;
				}
				else
				{
					var x=new TwoDGeometry.vector(Math.abs(collectedGeometryPoints[choosenI_e].x), collectedGeometryPoints[choosenI_e].y);
					x.type=parseInt(collectedGeometryPoints[choosenI_e].text);
					this.beamPoints.push(x);
					pointUsed[choosenI_e]=true;
				}
			}
			if(this.beamPoints[0].y>this.beamPoints[this.beamPoints.length-1].y)
			{
				this.beamPoints.reverse();
			}
		}
		//rávetítem a marker pontokat a tartó geometriára
		for(var i=0; i<collectedMarkerPoints.length; i++)
		{
			for(var j=0; j<this.beamPoints.length-1; j++)
			{
				if(this.beamPoints[j].y==collectedMarkerPoints[i].y)
				{
					if(this.beamPoint[j].type==0)
					{
						var x=new TwoDGeometry.vector(Math.abs(collectedMarkerPoints[i].x), collectedMarkerPoints[i].y);
						x.type=parseInt(collectedMarkerPoints[i].text)-10;
						this.beamPoints.splice(j, 1, x);
						break;
					}
					else
					{
						throw("Beam point conflict at projection!");
					}
				}
				if(this.beamPoints[j].y<collectedMarkerPoints[i].y && this.beamPoints[j+1].y>collectedMarkerPoints[i].y)
				{
					var xx=Math.abs(this.beamPoints[j].x)+(this.beamPoints[j+1].x-this.beamPoints[j].x)/(this.beamPoints[j+1].y-this.beamPoints[j].y)*(collectedMarkerPoints[i].y-this.beamPoints[j].y);
					var x=new TwoDGeometry.vector(xx, collectedMarkerPoints[i].y);
					x.type=parseInt(collectedMarkerPoints[i].text)-10;
					this.beamPoints.splice(j+1, 0, x);
					break;
				}
			}
			if(this.beamPoints[this.beamPoints.length-1].y==collectedMarkerPoints[i].y)
			{
				if(this.beamPoints[this.beamPoints.length-1].type==0)
				{
					var x=new TwoDGeometry.vector(Math.abs(collectedMarkerPoints[i].x), collectedMarkerPoints[i].y);
					x.type=parseInt(collectedMarkerPoints[i].text)-10;
					this.beamPoints.splice(this.beamPoints.length-1, 1, x);
					break;
				}
				else
				{
					throw("Beam point conflict at projection!");
				}
			}
		}
		
		//pontok besűrítése
		//legnagyobb megengedett távolság
		var maxDistanceAllowed=500;
		//végig megyek a szakaszokon
		//kicsit kakás, mert a this.beamPoint hosszát változtatom azzal, hogy újabb pontokat szúrok be
		for(var i=0; i<this.beamPoints.length-1; i++)
		{
			//az aktuális pont távolsága a következőtől
			var distance=this.beamPoints[i].distance(this.beamPoints[i+1]);
			if(distance>maxDistanceAllowed)
			{
				//ennyi részre kell felosztani a szakaszt
				var k=Math.ceil(distance/maxDistanceAllowed);
				var dx=(this.beamPoints[i+1].x-this.beamPoints[i].x)/k;
				var dy=(this.beamPoints[i+1].y-this.beamPoints[i].y)/k;
				//beszúrjuk az új pontokat
				for(var j=1; j<k; j++)
				{
					var x=new TwoDGeometry.vector(this.beamPoints[i].x+j*dx, this.beamPoints[i].y+j*dy);
					x.type=0;
					this.beamPoints.splice(i+j, 0, x);
				}
				i+=k-1;
			}
		}
		
		//közeli pontok eltávolítása
		var minDistanceAllowed=40;
		for(var i=0; i<this.beamPoints.length-1; i++)
		{
			//az aktuális pont távolsága a következőtől
			var distance=this.beamPoints[i].distance(this.beamPoints[i+1]);
			if(distance<minDistanceAllowed)
			{
				var isLowerPointImportant=(this.beamPoints[i].type>0 || i==0);
				var isUpperPointImportant=(this.beamPoints[i+1].type>0 || i==this.beamPoints.length-1);
				if(isLowerPointImportant)
				{
					if(isUpperPointImportant)
					//mindkét pontot meg kell tartani
					{
						dump("Points "+i+" and "+(i+1)+" are too near to each other, but none of them can be removed!\n");
					}
					else
					//a felső pont kidobható
					{
						this.beamPoints.splice(i+1, 1);
						//dump("Point "+(i+1)+" removed.\n");
						i--;
					}
				}
				else
				{
					if(isUpperPointImportant)
					//az alsó pont kidobható
					{
						this.beamPoints.splice(i, 1);
						//dump("Point "+i+" removed.\n");
						i--;
					}
					else
					//bármelyik kidobható, kérdés, hogy melyik legyen az
					{
						this.beamPoints.splice(i, 1);
						//dump("Point "+i+" removed.\n");
						i--;
					}
				}

			}
		}
		
		this.podestLevels.sort(function(a, b){return a - b;});
		collectedSectionLevels.sort(function(a, b){return a - b;});
		this.lowerConcreteLevel=collectedSectionLevels[0];
		this.upperConcreteLevel=collectedSectionLevels[collectedSectionLevels.length-1];
	};
	return this;
}

//****************************
// loadRTBData
//****************************

//ez hívódik meg, miután a felhasználó kiválasztja a fájlt
function loadRTBData(file)
{
	dump("loadRTBData starts\n");
	//dump("specified file: "+file.leafName+"\n");
	actualRTBData=new rtbData();
	actualRTBData.fileNameTrunk=(String.split(file.leafName, "."))[0];
	var fileToLoad=file;
	var lineData = {};
	// bea
	actualRTBData.beamPoints.length=0;
	fileToLoad.leafName=actualRTBData.fileNameTrunk+".bea";
	if(fileToLoad.exists())
	{
		dump(fileToLoad.leafName+" will be read\n");
		var fis = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		fis.init(fileToLoad, -1, -1, 0);
		var lis = fis.QueryInterface(Components.interfaces.nsILineInputStream);
		var cont;
		do
		{
			//dump(lineData.value+"\n");
			cont=lis.readLine(lineData);
			var perPerPos=lineData.value.indexOf("//");
			if(perPerPos>=0)
			{
				var dataPart=lineData.value.substring(0, perPerPos);
				var commentPart=lineData.value.substring(perPerPos+2, lineData.value.length);
			}
			else
			{
				var dataPart=lineData.value
				var commentPart="";
			}
			//dump("#"+dataPart+"#"+commentPart+"#\n");
			var secondSplit=dataPart.split(/\s{1,}/);
			if(secondSplit.length>=3)
			{
				var x=new TwoDGeometry.vector(parseFloat(secondSplit[0])*1000, parseFloat(secondSplit[1])*1000);
				x.type=parseInt(secondSplit[2]);
				x.comment=commentPart;
				actualRTBData.beamPoints.push(x);
			}
		}
		while(cont);
	}
	else
	{
		dump(fileToLoad.leafName+" does not exist\n");
	}
	// con
	actualRTBData.contourPoints.length=0;
	fileToLoad.leafName=actualRTBData.fileNameTrunk+".con";
	if(fileToLoad.exists())
	{
		dump(fileToLoad.leafName+" will be read\n");
		var fis = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		fis.init(fileToLoad, -1, -1, 0);
		var lis = fis.QueryInterface(Components.interfaces.nsILineInputStream);
		var cont;
		do
		{
			//dump(lineData.value+"\n");
			cont=lis.readLine(lineData);
			var perPerPos=lineData.value.indexOf("//");
			if(perPerPos>=0)
			{
				var dataPart=lineData.value.substring(0, perPerPos);
				var commentPart=lineData.value.substring(perPerPos+2, lineData.value.length);
			}
			else
			{
				var dataPart=lineData.value
				var commentPart="";
			}
			var secondSplit=dataPart.split(/\s{1,}/);
			if(secondSplit.length>=2)
			{
				var x=new TwoDGeometry.vector(parseFloat(secondSplit[0])*1000, parseFloat(secondSplit[1])*1000);
				actualRTBData.contourPoints.push(x);
			}
		}
		while(cont);
	}
	else
	{
		dump(fileToLoad.leafName+" does not exist\n");
	}
	// pod
	actualRTBData.podestLevels.length=0;
	fileToLoad.leafName=actualRTBData.fileNameTrunk+".pod";
	if(fileToLoad.exists())
	{
		dump(fileToLoad.leafName+" will be read\n");
		var fis = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		fis.init(fileToLoad, -1, -1, 0);
		var lis = fis.QueryInterface(Components.interfaces.nsILineInputStream);
		var cont;
		do
		{
			//dump(lineData.value+"\n");
			cont=lis.readLine(lineData);
			var perPerPos=lineData.value.indexOf("//");
			if(perPerPos>=0)
			{
				var dataPart=lineData.value.substring(0, perPerPos);
				var commentPart=lineData.value.substring(perPerPos+2, lineData.value.length);
			}
			else
			{
				var dataPart=lineData.value
				var commentPart="";
			}
			if(dataPart.length>0)
			{
				actualRTBData.podestLevels.push(parseFloat(dataPart)*1000);
			}
		}
		while(cont);
	}
	else
	{
		dump(fileToLoad.leafName+" does not exist\n");
	}
	// dat
	fileToLoad.leafName=actualRTBData.fileNameTrunk+".dat";
	if(fileToLoad.exists())
	{
		dump(fileToLoad.leafName+" will be read\n");
		var fis = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		fis.init(fileToLoad, -1, -1, 0);
		var lis = fis.QueryInterface(Components.interfaces.nsILineInputStream);
		var cont;
		var i=0;
		do
		{
			cont=lis.readLine(lineData);
			var perPerPos=lineData.value.indexOf("//");
			if(perPerPos>=0)
			{
				var dataPart=lineData.value.substring(0, perPerPos);
				var commentPart=lineData.value.substring(perPerPos+2, lineData.value.length);
			}
			else
			{
				var dataPart=lineData.value
				var commentPart="";
			}
			if(dataPart.length>0)
			{
				switch(i)
				{
					case 0:
						actualRTBData.teilung=parseInt(dataPart);
						i++;
						break;
					case 1:
						actualRTBData.lowerConcreteLevel=parseFloat(dataPart)*1000;
						i++;
						break;
					case 2:
						actualRTBData.upperConcreteLevel=parseFloat(dataPart)*1000;
						i++;
						break;
					default:
				}
			}
		}
		while(cont);
	}
	else
	{
		dump(fileToLoad.leafName+" does not exist\n");
	}
	renderAll();
	dump("loadRTBData ends\n");
}

//****************************
// saveRTBData
//****************************

function writeString(stream, str)
{
	var str2=str.toString();
	stream.write(str2, str2.length);
}

//ez hívódik meg, miután a felhasználó kiválasztja a fájlt
function saveRTBData(file)
{
	dump("saveRTBData starts\n");
	//dump("specified file: "+file.leafName+"\n");
	actualRTBData.fileNameTrunk=file.leafName.split(".")[0];
	var fileToSaveIn=file;
	// bea
	fileToSaveIn.leafName=actualRTBData.fileNameTrunk+".bea";
	//dump(fileToSaveIn.leafName+" will be written\n");
	var fos = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
	fos.init(fileToSaveIn, -1, -1, 0);
	writeString(fos, "//Beam points\n");
	writeString(fos, "//Radius (m)\tHeight (m)\tType\n\n");
	for(var i=0; i<actualRTBData.beamPoints.length; i++)
	{
		var p=actualRTBData.beamPoints[i];
		var str=(p.x/1000).toFixed(5)+"\t"+(p.y/1000).toFixed(5)+"\t"+p.type;
		if(p.type==2) str+=" //DGL";
		if(p.type==3) str+=" //ZGL";
		if(p.type==4) str+=" //ZGL";
		str+="\n";
		writeString(fos, str);
	}
	fos.close();
	// con
	fileToSaveIn.leafName=actualRTBData.fileNameTrunk+".con";
	//dump(fileToSaveIn.leafName+" will be written\n");
	var fos = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
	fos.init(fileToSaveIn, -1, -1, 0);
	writeString(fos, "//Contour points\n");
	writeString(fos, "//Radius (m)\tHeight (m)\n\n");
	for(var i=0; i<actualRTBData.contourPoints.length; i++)
	{
		var p=actualRTBData.contourPoints[i];
		var str=(p.x/1000).toFixed(5)+"\t"+(p.y/1000).toFixed(5)+"\n";
		writeString(fos, str);
	}
	fos.close();
	// pod
	fileToSaveIn.leafName=actualRTBData.fileNameTrunk+".pod";
	//dump(fileToSaveIn.leafName+" will be written\n");
	var fos = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
	fos.init(fileToSaveIn, -1, -1, 0);
	writeString(fos, "//Podest levels\n");
	writeString(fos, "//Height (m)\n\n");
	for(var i=0; i<actualRTBData.podestLevels.length; i++)
	{
		var y=actualRTBData.podestLevels[i];
		var str=(y/1000).toFixed(5)+"\n";
		writeString(fos, str);
	}
	fos.close();
	// dat
	fileToSaveIn.leafName=actualRTBData.fileNameTrunk+".dat";
	//dump(fileToSaveIn.leafName+" will be written\n");
	var fos = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
	fos.init(fileToSaveIn, -1, -1, 0);
	writeString(fos, "//Miscellaneous information\n\n");
	writeString(fos, actualRTBData.teilung+" //number of beam circumference\n");
	writeString(fos, (actualRTBData.lowerConcreteLevel/1000).toPrecision(5)+" //lower conctere level\n");
	writeString(fos, (actualRTBData.upperConcreteLevel/1000).toPrecision(5)+" //upper conctere level\n");
	fos.close();

	dump("saveRTBData ends\n");
}

//****************************
// openDXFFile
//****************************

//A felhasználó kiválasztja a fájlt
//aztán meghívja a "processFile" függvényt
function openDXFFile()
{
	dump("openDXFFile starts\n");
	Components.utils.import("resource://gre/modules/NetUtil.jsm");
	const nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "File to open", nsIFilePicker.modeOpen);
	fp.appendFilter("DXF files", "*.dxf");
	fp.appendFilters(nsIFilePicker.filterAll);
	var cb={};
	cb.done=function(x)
	{
		if (x == nsIFilePicker.returnOK || x == nsIFilePicker.returnReplace)
		{
			//clears any previous RTBData
			actualRTBData=null;
			//clears any previous TrussData
			actualTrussData=null;	
			processDXFFile(fp.file);
			//var refFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).      get("Home", Components.interfaces.nsIFile);
			//document.title="RTB Ortoscope : "+fp.file.getRelativeDescriptor(refFile);
			lastOpenedFileName=fp.file.leafName;
			document.title="RTB Ortoscope : "+lastOpenedFileName;
		}
	}
	fp.open(cb);
	dump("openDXFFile ends\n");
}

//****************************
// openRTBFile
//****************************

function openRTBFile()
{
	dump("openRTBFile starts\n");
	Components.utils.import("resource://gre/modules/NetUtil.jsm");
	const nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "File to open", nsIFilePicker.modeOpen);
	fp.appendFilter("RTB files", "*.bea; *.con; *.pod; *.dat; *.add; *.sup");
	fp.appendFilters(nsIFilePicker.filterAll);
	//fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
	var cb={};
	cb.done=function(x)
	{
		if (x == nsIFilePicker.returnOK || x == nsIFilePicker.returnReplace)
		{
			loadRTBData(fp.file);
		}
	}
	fp.open(cb);
	dump("openRTBFile ends\n");
}

function flipMirror()
{
	if(actualRTBData!=null)
	{
		actualRTBData.mirror=actualRTBData.mirror?false:true;
		renderAll();
	}
}

//****************************
// saveRTBFiles
//****************************

function saveRTBFiles()
{
	dump("saveRTBFiles starts\n");
	if(actualRTBData!=null)
	{
		Components.utils.import("resource://gre/modules/NetUtil.jsm");
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, "File to save in", nsIFilePicker.modeSave);
		fp.appendFilters(nsIFilePicker.filterAll);
		fp.defaultString=lastOpenedFileName.split(".")[0];
		var cb={};
		cb.done=function(x)
		{
			if (x == nsIFilePicker.returnOK || x == nsIFilePicker.returnReplace)
			{
				saveRTBData(fp.file);
			}
		}
		fp.open(cb);
	}
	else
	{
		alert("No RTB data present!");
	}
	dump("saveRTBFiles ends\n");
}

//****************************
// extractRTBData
//****************************

function extractRTBData()
{
	dump("extractRTBData starts\n");
	if(actualDrawing!=null)
	{
		actualRTBData=new rtbData();
		actualRTBData.extractFrom(actualDrawing);
		renderAll();
	}
	else
	{
		alert("No drawing present!");
	}
	dump("extractRTBData ends\n");
}

//****************************
// extractRTBDataExperimentel
//****************************

function extractRTBDataExperimentel()
{
	dump("extractRTBDataExperimentel starts\n");
	if(actualDrawing!=null)
	{
		actualRTBData=new rtbData();
		actualRTBData.extractExperimentalFrom(actualDrawing);
		renderAll();
	}
	else
	{
		alert("No drawing present!");
	}
	dump("extractRTBDataExperimentel ends\n");
}



//####################################################
//####################################################
//####################################################


//****************************
// trussRod
//****************************

function trussRod(i0, i1)
{
	this.startNodeIndex=Math.min(i0, i1);
	this.endNodeIndex=Math.max(i0, i1);
	this.type=0;
	this.E=1;
	this.A=1;
	this.I=1;
	this.tag="*";
	return this;
}

function trussRodBad(v0, v1)
{
	this.startPoint=v0;
	this.endPoint=v1;
	return this;
}

function trussNodeLoad(_nodeIndex, _Fx=0, _Fy=0, _M=0)
{
	this.nodeIndex=_nodeIndex;
	this.Fx=_Fx;
	this.Fy=_Fy;
	this.M=_M;
	return this;
}


//****************************
// trussData
//****************************

function trussData()
{
	this.nodes=[];
	this.rods=[];
	this.badRods=[];
	this.supports=[];
	this.nodeLoads=[];
	this.concentratedLoads=[];
	this.distributedLoads=[];
	//....................................................................................................
	this.render=function(c, view)
	{
		dump("trussData.render starts\n");	
		//nodes
		//rods
		c.lineWidth=4/actualView.scale;
		c.strokeStyle="rgba(0, 0, 255, 0.5)";
		c.fillStyle="rgba(0, 0, 255, 0.5)";
		c.beginPath();
		for(var i=0; i<this.rods.length; i++)
		{
			var startNodeIndex=this.rods[i].startNodeIndex;
			var endNodeIndex=this.rods[i].endNodeIndex;
			c.moveTo(this.nodes[startNodeIndex].x*1000, this.nodes[startNodeIndex].y*1000);
			c.lineTo(this.nodes[endNodeIndex].x*1000, this.nodes[endNodeIndex].y*1000);
		}
		c.closePath();
		c.stroke();
		
		c.strokeStyle="rgba(255, 0, 0, 0.5)";
		c.fillStyle="rgba(255, 0, 0, 0.5)";
		for(var i=0; i<this.nodes.length; i++)
		{
			//dump(this.nodes[i].toString()+"\n");
			c.beginPath();
			c.arc(this.nodes[i].x*1000, this.nodes[i].y*1000, 3/actualView.scale, 0, 2*Math.PI, true);
			c.closePath();
			c.fill();
			c.stroke();
			c.save();
			c.translate(this.nodes[i].x*1000, this.nodes[i].y*1000);
			c.scale(1, -1);
			c.font=("50px sans-serif");
			c.textBaseline="middle";
			c.fillText("("+i+")", 5/actualView.scale, 0);
			c.restore();
		}
		
		c.strokeStyle="rgba(0, 255, 0, 0.5)";
		c.beginPath();
		for(var i=0; i<this.badRods.length; i++)
		{
			c.moveTo(this.badRods[i].startPoint.x, this.badRods[i].startPoint.y);
			c.lineTo(this.badRods[i].endPoint.x, this.badRods[i].endPoint.y);
		}
		c.closePath();
		c.stroke();
		
		dump("trussData.render ends\n");
	};
	//....................................................................................................
	this.extractFrom=function(drawing)
	{
		var collectedNodeTexts=[];
		var collectedRodLines=[];
		var collectedRodTexts=[];
		for(var i=0; i<drawing.entities.objects.length; i++)
		{
			var x=drawing.entities.objects[i];
			switch(x.layer.toLowerCase())
			{
				case "nodes":
					if(x.type=="TEXT")
					{
						collectedNodeTexts.push(x);
					}
					break;
				case "rods":
					if(x.type=="LINE")
					{
						collectedRodLines.push(x);
					}
					if(x.type=="TEXT")
					{
						collectedRodTexts.push(x);
					}
					break;
				default:
			}
		}
		//dump("Number of collected node texts: "+collectedNodeTexts.length+"\n");
		//dump("Number of collected rod lines: "+collectedRodLines.length+"\n");
		//dump("Number of collected rod texts: "+collectedRodTexts.length+"\n");
		
		//fill nodes array
		for(var i=0; i<collectedNodeTexts.length; i++)
		{
			var x=collectedNodeTexts[i];
			var index=parseInt(x.text);
			if(index<this.nodes.length)
			{
				if(this.nodes[i]!=null)
				{
					dump("Duplicated node No. "+index+"\n");
				}
			}
			this.nodes[index]=new TwoDGeometry.vector(x.x/1000, x.y/1000);
		}
		
		//fill rods array
		for(i=0; i<collectedRodLines.length; i++)
		{
			var x=collectedRodLines[i];
			var point1Index=null;
			var point2Index=null;
			var point1=new TwoDGeometry.vector(x.x1/1000, x.y1/1000);
			var point2=new TwoDGeometry.vector(x.x2/1000, x.y2/1000);
			for(var j=0; j<this.nodes.length; j++)
			{
				if(point1.distance(this.nodes[j])<0.001)
				{
					point1Index=j;
				}
				if(point2.distance(this.nodes[j])<0.001)
				{
					point2Index=j;
				}
			}
			if(point1Index==null || point2Index==null)
			{
				dump("Not any node found for this rod.\n");
				this.badRods.push(new trussRodBad(point1, point2));
			}
			else
			{
				this.rods.push(new trussRod(point1Index, point2Index));
			}
		}
		
		for(var i=0; i<this.rods.length; i++)
		{
			var x=this.rods[i];
			var p0=this.nodes[x.startNodeIndex];
			var p1=this.nodes[x.endNodeIndex];
			var c=new TwoDGeometry.vector(0.5*(this.nodes[x.startNodeIndex].x+this.nodes[x.endNodeIndex].x), 0.5*(this.nodes[x.startNodeIndex].y+this.nodes[x.endNodeIndex].y));
			for(var j=0; j<collectedRodTexts.length; j++)
			{
				var p=new TwoDGeometry.vector(collectedRodTexts[j].x/1000, collectedRodTexts[j].y/1000);
				if(p.distance(c)<0.001)
				{
					x.tag=collectedRodTexts[j].text;
					collectedRodTexts.splice(j,1);
					break;
				}
			}
		}
		
		//rendezem a rudakat típus
		this.rods.sort(function(a,b)
			{
				//típus (tag) szerint
				if(parseInt(a.tag)==parseInt(b.tag))
				{
					//alsó-felső végpont sorszám távolsága szerint
					if((a.endNodeIndex-a.startNodeIndex)==(b.endNodeIndex-b.startNodeIndex))
					{
						//alsó végpont sorszáma szerint
						if(a.endNodeIndex==b.endNodeIndex)
						{
							return 0;
						}
						else
						{
							return a.endNodeIndex-b.endNodeIndex;
						}
					}
					else
					{
						return (a.endNodeIndex-a.startNodeIndex)-(b.endNodeIndex-b.startNodeIndex);
					}
				}
				else
				{
					return parseInt(a.tag)-parseInt(b.tag)
				}
			});
		
		//Ez egy vad hack, a terheket ráteszem a létrára
		//önsúly (0,7 kN/m, mindent az alsó és felső övre rakok, biztonsági téynező 1,35)
		for(var i=0; i<this.rods.length; i++)
		{
			var x=this.rods[i];
			if(x.tag=="1" || x.tag=="2")
			{
				var Fy=1.35*-0.35*this.nodes[x.startNodeIndex].distance(this.nodes[x.endNodeIndex])/2.0;
				this.nodeLoads.push(new trussNodeLoad(x.startNodeIndex, 0, Fy, 0));
				this.nodeLoads.push(new trussNodeLoad(x.endNodeIndex, 0, Fy, 0));
			}
		}
		//járóteher (vízszintes 2,40 kN/m2, tartók távolsága 1,7 m, biztonsági tényező 1,5)
		for(var i=0; i<this.rods.length; i++)
		{
			var x=this.rods[i];
			if(x.tag=="1" || x.tag=="5")
			{
				var Fy=1.5*1.7/2*-2.40*Math.abs(this.nodes[x.startNodeIndex].x-this.nodes[x.endNodeIndex].x)/2.0;
				this.nodeLoads.push(new trussNodeLoad(x.startNodeIndex, 0, Fy, 0));
				this.nodeLoads.push(new trussNodeLoad(x.endNodeIndex, 0, Fy, 0));
			}
		}
		
		//rendezem a terheket csomópont sorszám szerint
		this.nodeLoads.sort(function(a,b)
		{
			return a.nodeIndex-b.nodeIndex;
		});
		
		//EZ MÉG NINCS KÉSZ!!!
	};
	
	this.saveToFile=function(file)
	{
		var fos = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		fos.init(file, -1, -1, 0);
		writeString(fos, "FRAM project\n");
		writeString(fos, "\nNodes\n");
		for(var i=0; i<this.nodes.length; i++)
		{
			var x=this.nodes[i];
			writeString(fos, i);
			writeString(fos, " ");
			writeString(fos, (x.x).toFixed(3));
			writeString(fos, " ");
			writeString(fos, (x.y).toFixed(3));
			writeString(fos, "\n");
		}
		writeString(fos, "\nRods\n");
		for(var i=0; i<this.rods.length; i++)
		{
			var x=this.rods[i];
			writeString(fos, i);
			writeString(fos, " ");
			writeString(fos, x.startNodeIndex);
			writeString(fos, " ");
			writeString(fos, x.endNodeIndex);
			writeString(fos, " ");
			writeString(fos, x.type);
			writeString(fos, " ");
			writeString(fos, x.E);
			writeString(fos, " ");
			writeString(fos, x.A);
			writeString(fos, " ");
			writeString(fos, x.I);
			writeString(fos, " ");
			writeString(fos, x.tag);
			writeString(fos, "\n");
		}
		writeString(fos, "\nSupports\n");
		for(var i=0; i<this.supports.length; i++)
		{
		}
		writeString(fos, "\nNode loads\n");
		for(var i=0; i<this.nodeLoads.length; i++)
		{
			var x=this.nodeLoads[i];
			writeString(fos, i);
			writeString(fos, " ");
			writeString(fos, x.nodeIndex);
			writeString(fos, " ");
			writeString(fos, x.Fx);
			writeString(fos, " ");
			writeString(fos, x.Fy);
			writeString(fos, " ");
			writeString(fos, x.M);
			writeString(fos, "\n");
		}
		writeString(fos, "\nConcentrated loads\n");
		for(var i=0; i<this.concentratedLoads.length; i++)
		{
		}
		writeString(fos, "\nDistributed loads\n");
		for(var i=0; i<this.distributedLoads.length; i++)
		{
		}
		fos.close();
	}
	return this;
}



//****************************
// extractTrussData
// Menu function
//****************************

function extractTrussData()
{
	dump("extractTrussData starts\n");
	if(actualDrawing!=null)
	{
		actualTrussData=new trussData();
		actualTrussData.extractFrom(actualDrawing);
		renderAll();
	}
	else
	{
		alert("No drawing present!");
	}
	dump("extractTrussData ends\n");
}

function saveTrussData()
{
	dump("saveTrussData starts\n");
	if(actualTrussData!=null)
	{
		Components.utils.import("resource://gre/modules/NetUtil.jsm");
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, "File to save in", nsIFilePicker.modeSave);
		fp.appendFilter("Text files", "*.txt");
		fp.appendFilters(nsIFilePicker.filterAll);
		var cb={};
		cb.done=function(x)
		{
			if (x == nsIFilePicker.returnOK || x == nsIFilePicker.returnReplace)
			{
				actualTrussData.saveToFile(fp.file);
			}
		}
		fp.open(cb);
	}
	else
	{
		alert("No truss data present!");
	}
	dump("saveTrussData ends\n");
}

//===============================================
//Ez hack! És nincs is kész
//A rúd típusok keresztmetszeti értékei
/*var crossSectionTable=
[
	"210000000 ", //cső d=60,3mm / 5m
	""
];*/



//****************************
// findAxes
//****************************

function SectionShadow(s)
//o: a DXF line object
{
	this.angle=null;
	this.arm=null;
	this.t0=null;
	this.t1=null;
	this.layer=null;
	if(s!=undefined)
	{
		var u=s.p1.minus(s.p0).unitVector();
		this.angle=u.getAngle();
		this.arm=u.vectorProduct(s.p0);
		this.t0=u.scalarProduct(s.p0);
		this.t1=u.scalarProduct(s.p1);
		if(this.angle>=Math.PI)
		{
			this.angle-=Math.PI;
			this.arm*=-1;
			var tt=-this.t0;
			this.t0=-this.t1;
			this.t1=tt;
		}
	}
	return this;
};

SectionShadow.prototype.getAsSection=function()
{
	var p0x=-Math.sin(this.angle)*this.arm+Math.cos(this.angle)*this.t0;
	var p0y=Math.cos(this.angle)*this.arm+Math.sin(this.angle)*this.t0;
	var p1x=-Math.sin(this.angle)*this.arm+Math.cos(this.angle)*this.t1;
	var p1y=Math.cos(this.angle)*this.arm+Math.sin(this.angle)*this.t1;
	return new TwoDGeometry.section(new TwoDGeometry.vector(p0x, p0y), new TwoDGeometry.vector(p1x, p1y));
};

SectionShadow.prototype.toString=function()
{
	var str="SectionShadow\n";
	str+="   angle = "+this.angle*180/Math.PI+"\n";
	str+="   arm = "+this.arm+"\n";
	str+="   t0 = "+this.t0+"\n";
	str+="   t1 = "+this.t1+"\n";
	str+="   layer = "+this.layer+"\n";
	return str;
}

function MiddleAxes()
{
	this.lines=[];

	this.render=function(c, view)
	{
		dump("MiddleAxes.render starts\n");	
		//nodes
		//rods
		c.lineWidth=2/actualView.scale;
		c.strokeStyle="rgba(255, 0, 0, 0.5)";
		c.fillStyle="none";
		c.beginPath();
		for(var i=0; i<this.lines.length; i++)
		{
			c.moveTo(this.lines[i].p0.x, this.lines[i].p0.y);
			c.lineTo(this.lines[i].p1.x, this.lines[i].p1.y);
		}
		c.closePath();
		c.stroke();
		dump("MiddleAxes.render starts\n");	
	}
	return this;
}

function findAxes()
{
	//Kísérleti!!!
	dump("findAxes starts\n");
	
	//var k=new TwoDGeometry.section(new TwoDGeometry.vector(-2, 1), new TwoDGeometry.vector(0, 2));
	//dump(k.toString());
	//var sk=new SectionShadow(k);
	//dump(sk.toString());
	
	var k=new TwoDGeometry.section(new TwoDGeometry.vector(0, 2), new TwoDGeometry.vector(-2, 1));
	//dump(k.toString());
	
	var sk=new SectionShadow(k);
	//dump(sk.toString());
	
	var angleTolerance=0.00001*Math.PI/180;
	var shadowObjects=[];
	var a=new MiddleAxes();
	if(actualDrawing!=null)
	{
		for(var i=0; i<actualDrawing.entities.objects.length; i++)
		{
			var o=actualDrawing.entities.objects[i];
			//if(o.type=="LINE")
			//{
				//var s=new TwoDGeometry.section(new TwoDGeometry.vector(o.x1, o.y1), new TwoDGeometry.vector(o.x2, o.y2));
				//aztán majd később párhuzamosokat keresni
				//a.lines.push(s);
				//var s=new TwoDGeometry.section(new TwoDGeometry.vector(o.x1, o.y1), new TwoDGeometry.vector(o.x2, o.y2));
				//var ss=new SectionShadow(s);
				//shadowObjects.push(ss);
			//}
			//a blokkokat is ki kell bontani rekurzívan!!!
			switch(o.type)
			{
				case "LINE":
					var s=new TwoDGeometry.section(new TwoDGeometry.vector(o.x1, o.y1), new TwoDGeometry.vector(o.x2, o.y2));
					var ss=new SectionShadow(s);
					shadowObjects.push(ss);
					break;
				default:
			}
		}
		for(var i=0; i<(shadowObjects.length-1); i++)
		{
			var ssi=shadowObjects[i];
			for(var j=i+1; j<shadowObjects.length; j++)
			{
				var ssj=shadowObjects[j];
				if(Math.abs(ssi.angle-ssj.angle)<angleTolerance)
				{
					var d=Math.abs(ssi.arm-ssj.arm);
					if(Math.abs(ssi.t0-ssj.t0)<=d && Math.abs(ssi.t1-ssj.t1)<=d && Math.abs(d)<=100)
					{
						var m=new SectionShadow();
						m.angle=(ssi.angle+ssj.angle)/2;
						m.arm=(ssi.arm+ssj.arm)/2;
						m.t0=(ssi.t0+ssj.t0)/2;
						m.t1=(ssi.t1+ssj.t1)/2;
						a.lines.push(m.getAsSection());
					}
				}
			}
		}
	}
	else
	{
		dump("actualDrawing=null\n");
	}
	
	//a.lines.push(new TwoDGeometry.section(new TwoDGeometry.vector(0,0), new TwoDGeometry.vector(5, 5)));
	actualMiddleAxes=a;
	dump("findAxes ends\n");
}
