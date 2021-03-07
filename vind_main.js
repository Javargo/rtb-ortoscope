//****************************************
//VECTORIAL PATTERN FINDING RESEARCH
//****************************************
//Copyright: Major, Balazs
//E-mail: majorstructures@gmail.com
//****************************************
//Change history
//2020-01-06

//****************************************
//Todo

//****************************************
//Dependencies
//TwoDGeometry.js
//DXFLib.js

//****************************************
var canvasControl;
var drawingURL="test_data/Kegel.dxf";
var patternURL="test_data/ZGLM30.dxf";
var drawingDFXDoc;
var patternDXFDoc;
var matches=[];
var axes=[];


function bodyLoaded(e)
{
	canvasControl=document.getElementById("paint_area");
	smartizeCanvas(canvasControl);
	readDXFFromURL(drawingURL, drawingLoaded);
};

function drawingLoaded(doc)
{
	drawingDFXDoc=doc;
	//központosítja a rajzot. Lehetne javítani a függvény argumentumain
	canvasControl.actualView.centerDrawingOnCanvas(drawingDFXDoc, canvasControl);
	readDXFFromURL(patternURL, patternLoaded);
}

function patternLoaded(doc)
{
	patternDFXDoc=doc;
	var drawingPrimitives=breakdownDXFDoc(drawingDFXDoc);
	var patternPrimitives=breakdownDXFDoc(patternDFXDoc);
	matches=findMatches(drawingPrimitives, patternPrimitives);
	axes=findAxes(drawingPrimitives);
	renderDrawing();
}

//Minta felismerés
function findMatches(drawingPrimitives, patternPrimitives)
{
	var results=[];
	//összeszámolom, hány elem van a mintában
	//MOST CSAK A VONALAKAT VIZSGÁLOM!
	var countOfElements=0;
	for(var i=0; i<patternPrimitives.length; i++)
	{
		if(patternPrimitives[i].constructor==SimpleSection)
		{
			countOfElements++;
		}
	}
	//adok egy súlyszámot mindegyik elemnek, hogy a találatok pontossága értékelhető legyen
	for(var i=0; i<patternPrimitives.length; i++)
	{
		if(patternPrimitives[i].constructor==SimpleSection)
		{
			patternPrimitives[i].weight=1/countOfElements;
		}
	}
	var transformations=[];
	//itt kezdődik a rajz és minta összehasonlítása
	for(var i=0; i<drawingPrimitives.length; i++)
	{
		var de=drawingPrimitives[i];
		for(var j=0; j<patternPrimitives.length; j++)
		{
			var pe=patternPrimitives[j];
			var toMiddle=new TwoDGeometry.Vector((pe.p0.x+pe.p1.x)/2, (pe.p0.y+pe.p1.y)/2);
			if(de.constructor==SimpleSection && pe.constructor==SimpleSection)
			{
				//egyforma a hosszuk?
				if(Math.abs(1-de.getLength2()/pe.getLength2())<0.01)
				{
					//egyforma hosszúak, szóval esélyes, hogy a minta része
					//ITT A LÉNYEG. LE KELLENE GYÁRTANI 4 TRANSZFORMÁCIÓT
					//most a tükrözést még nem csinálom
					var r=angleOfTwoSections(pe, de);
					var rv=new TwoDGeometry.Vector(Math.cos(r), Math.sin(r));
					var p=de.p0.plusNew(de.p1).multiplyNew(0.5).plusThis(toMiddle.rotateNew(rv));
					transformations.push(new TransformationObject(p, r, de, pe));
					r+=Math.PI;
					var rv=new TwoDGeometry.Vector(Math.cos(r), Math.sin(r));
					var p=de.p0.plusNew(de.p1).multiplyNew(0.5).plusThis(toMiddle.rotateNew(rv));
					transformations.push(new TransformationObject(p, r, de, pe));
				}
			}
		}
	}
	for(var i=0; i<transformations.length; i++)
	{
		//var similars=[];
		//similars.push(transformations[i]);
		var totalWeight=transformations[i].patternElementRef.weight;
		for(var j=i+1; j<transformations.length; j++)
		{
			if(transformations[i].isSimilar(transformations[j]))
			{
				//similars.push(transformations[j]);
				totalWeight+=transformations[j].patternElementRef.weight;
			}
		}
		if(totalWeight>0.7)
		{
			results.push(transformations[i]);
		}
	}
	return results;
}


//Tartó tengely felismerés
function findAxes(drawingPrimitives)
{
	var results=[];
	var shadowObjects=[];
	var angleTolerance=0.001;
	var distanceTolerance=0.1;
	for(var i=0; i<drawingPrimitives.length; i++)
	{
		if(drawingPrimitives[i].constructor==SimpleSection)
		{
			shadowObjects.push(new SectionShadow(drawingPrimitives[i]));
		}	
	}
	//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
	//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
	for(var i=0; i<shadowObjects.length; i++)
	{
		for(var j=i+1; j<shadowObjects.length; j++)
		{
			var angle=shadowObjects[i].angle-shadowObjects[j].angle;
			if(Math.abs(angle)<=angleTolerance || Math.abs(angle+Math.PI)<=angleTolerance || Math.abs(angle-Math.PI)<=angleTolerance)
			{
				if(Math.abs(shadowObjects[i].arm-shadowObjects[j].arm-160)<=distanceTolerance)
				{
					if(Math.abs(shadowObjects[i].t0-shadowObjects[j].t0)<=160+distanceTolerance)
					{
						if(Math.abs(shadowObjects[i].t0-shadowObjects[j].t0)<=160+distanceTolerance)
						{
							var m=new SectionShadow();
							m.angle=(shadowObjects[i].angle+shadowObjects[j].angle)/2;
							m.arm=(shadowObjects[i].arm+shadowObjects[j].arm)/2;
							m.t0=(shadowObjects[i].t0+shadowObjects[j].t0)/2;
							m.t1=(shadowObjects[i].t1+shadowObjects[j].t1)/2;
							results.push(m.getAsSection());
						}
					}
				}
			}
		}
	}
	//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	return results;
}


function renderDrawing()
{
	var c=canvasControl.getContext('2d');
	c.setTransform(1, 0, 0, 1, 0, 0);
	c.fillStyle = "white";
	c.fillRect(0, 0, c.canvas.width, c.canvas.height);
	if(drawingDFXDoc!=null)
	{
		drawingDFXDoc.render(c, canvasControl.actualView);
	}
	
	//minta találatok
	c.strokeStyle = "red";
	c.fillStyle="red";
	for(var i=0; i<matches.length; i++)
	{
		var t=matches[i];
		c.beginPath();
		c.arc(t.x, t.y, 30, 0, 2*Math.PI, true);
		c.closePath();
		c.fill();
		c.stroke();
	}
	
	//középvonalak
	c.strokeStyle="yellow";
	c.fillStyle="none";
	//c.lineWidth=2/canvasControl.scale;
	c.lineWidth=5;
	for(var i=0; i<axes.length; i++)
	{
		var s=axes[i];
		c.beginPath();
		c.moveTo(s.p0.x, s.p0.y);
		c.lineTo(s.p1.x, s.p1.y);
		c.closePath();
		c.stroke();
	}

}


//****************************
// Attaches mouse actions to canvas
//****************************

function smartizeCanvas(c)
{
	c.actualView=new ViewProperties();
	c.panStarted=false;
	c.addEventListener("wheel", function(e)
	{
		//A korzor koordinátái a canvason képpontban mérve. Csak akkor működik jól, ha nincs az egész lap bezúmolva
		var localScreenX=e.x-e.target.offsetLeft-e.target.clientLeft;
		var localScreenY=e.y-e.target.offsetTop-e.target.clientTop;
		var rescaleFactor=(1-e.deltaY/3*0.25);
		//A zúmolás után a kurzor ugyan arra pontra mutasson, mint előtte
		e.target.actualView.scale*=rescaleFactor;
		e.target.actualView.x=localScreenX-rescaleFactor*(localScreenX-e.target.actualView.x);
		e.target.actualView.y=localScreenY-rescaleFactor*(localScreenY-e.target.actualView.y);
		renderDrawing();
	});
	c.addEventListener("mousedown", function(e)
	{
		event.target.mouseDownX=e.x;
		event.target.mouseDownY=e.y;
		e.target.panStarted=true;
	});
	c.addEventListener("mouseup", function(e)
	{
		var mouseDeltaX=e.x-event.target.mouseDownX;
		var mouseDeltaY=e.y-event.target.mouseDownY;
		event.target.actualView.pan(mouseDeltaX, mouseDeltaY);
		e.target.panStarted=false;
		renderDrawing();
	});
	c.addEventListener("mousemove", function(e)
	{
		if(e.target.panStarted)
		{
			var mouseDeltaX=e.x-event.target.mouseDownX;
			var mouseDeltaY=e.y-event.target.mouseDownY;
			event.target.mouseDownX=e.x;
			event.target.mouseDownY=e.y;
			event.target.actualView.pan(mouseDeltaX, mouseDeltaY);
			renderDrawing();
		}
	});
	c.addEventListener("mouseout", function(e)
	{
		e.target.panStarted=false;
	});
}


//****************************
// TransformationObject
//****************************

//Ha a minta elemét rotation-nel elforgatjuk, majd a minta origóját a p pontba toljuk, akkor minta eleme (hibahatáron belül) meg fog egyezni a rajz elemével

function TransformationObject(p, r, de, pe)
//p: TwoDGeometry.Vector, a minta nullpontjának koordinátái
//r: float, az elforgatás
//de: object, a rajz eleme
//pe: object, a minta eleme
{
	TwoDGeometry.Vector.call(this, p.x, p.y);
	this.rotation=(r==null?0:r);
	this.drawingElementRef=de;
	this.patternElementRef=pe;
	return this;
}

//-----------------------------------------------------------------------
TransformationObject.prototype = Object.create(TwoDGeometry.Vector.prototype);

//-----------------------------------------------------------------------
TransformationObject.prototype.constructor = TransformationObject;

TransformationObject.prototype.isSimilar=function(t)
//x: TransformationObject to compare with
{
	var distanceTolerance=0.1;
	var rotationTolerance=0.01;
	var cond1=(this.minusNew(t).getLength()<=distanceTolerance);
	var cond2=(Math.abs(this.rotation-t.rotation)<=rotationTolerance || Math.abs(this.rotation-t.rotation-2*Math.PI)<=rotationTolerance || Math.abs(this.rotation-t.rotation+2*Math.PI)<=rotationTolerance);
	return cond1 && cond2;
}




function angleOfTwoSections(a, b)
{
	var eta=(a.p1.x-a.p0.x)*(b.p1.y-b.p0.y)-(b.p1.x-b.p0.x)*(a.p1.y-a.p0.y);
	if(eta==null) return 0;
	var ksi=(a.p1.x-a.p0.x)*(b.p1.x-b.p0.x)+(b.p1.y-b.p0.y)*(a.p1.y-a.p0.y);
	if(eta<0)
	{
		eta=-eta;
		ksi=-ksi;
	}
	if(ksi>0 && ksi>=eta) return Math.atan(eta/ksi);
	if(ksi<eta && ksi>-eta) return Math.PI/2-Math.atan(ksi/eta);
	return Math.PI-Math.atan(eta/-ksi);			
}


function readDXFFromURL(url, doAfter)
//doAfter: egy callback függvény, ami a beolvasás után az eredmény dokumentummal lesz meghívva 
{
	var request = new XMLHttpRequest();
	request.open("POST", url, true);
	request.overrideMimeType("text/plain; charset=x-user-defined");
	request.onload = function (e)
	{
		if (request.readyState === 4)
		{
			if (request.status === 200)
			{
				//var doc=processDXFText(request.responseText);
				var doc=new dxfDocument(request.responseText);
				doAfter(doc);
			}
			else
			{
				console.log("\nXMLHttpRequest error: "+request.statusText+"\n");
			}
		}
	};
	request.onerror = function (e)
	{
		console.log("\nXMLHttpRequest error: "+request.statusText+"\n");
	};
	request.send();
}





//Ez határozza meg hogy hova rajzolódjon az ábra a vásznon
function ViewProperties()
{
	this.x=0;
	this.y=0;
	this.scale=1;
	this.centerDrawingOnCanvas=function(drawing, canvas)
	{
		var b=drawing.getBoundingBox();
		var scaleGuessH=canvas.width/b.getWidth();
		var scaleGuessV=canvas.height/b.getHeight();
		this.scale=scaleGuessH<scaleGuessV?scaleGuessH:scaleGuessV;
		this.x=canvas.width/2.0-this.scale*b.getWidth()/2.0-this.scale*b.p0.x;
		this.y=canvas.height/2.0+this.scale*b.getHeight()/2.0+this.scale*b.p0.y;
	};
	this.pan=function(dx, dy)
	{
		this.x+=dx;
		this.y+=dy;
	};
	return this;
};


//****************************
// Vectorial shape finder
//****************************

//Adott alakzatot keres a rajzon
//A komplexebb objektumokat lebontom egyszerűekké:
// - szakaszok
// - körök
// - körcikkek
//A keresendő alakzatot is ilyen elemekre bontom.
//A keresendő alakzat minden egyes elemét összevetem a rajz minden egyes elemével. Ha létezik olyan transzformáció, amivel az alakzat eleme átvihető a rajz elemévé, akkor ennek a transzformációnak az adatait egy objektummá fogom össze, és az objektumot elmentem a transzformációk tömbjébe.
//Aztán a transzformációk tömbjében megkeresem az azonosakat. Ahol több azonos összegyűlik, ott egy alakzatot találtam.

function SimpleSection(parent, p0, p1)
{
	this.dxfRef=parent;
	TwoDGeometry.Section.call(this, p0, p1);
	return this;
}

//-----------------------------------------------------------------------
SimpleSection.prototype = Object.create(TwoDGeometry.Section.prototype);

//-----------------------------------------------------------------------
SimpleSection.prototype.constructor = SimpleSection;

SimpleSection.prototype.render=function(c, view)
{
	c.beginPath();
	c.strokeStyle = "red";
	c.moveTo(this.p0.x, this.p0.y);
	c.lineTo(this.p1.x, this.p1.y);
	c.closePath();
	c.stroke();
};

function dxfBlockTransformation(x, y, scaleX, scaleY, rotation)
{
	this.x=(x==undefined?0:x);
	this.y=(y==undefined?0:y);
	this.scaleX=(scaleX==undefined?1:scaleX);
	this.scaleY=(scaleY==undefined?1:scaleY);
	this.rotation=(rotation==undefined?0:rotation/180*Math.PI);
	return this;
}

dxfBlockTransformation.prototype.transform=function(x, y)
{
	var nx=this.x+Math.cos(this.rotation)*this.scaleX*x-Math.sin(this.rotation)*this.scaleY*y;
	var ny=this.y+Math.sin(this.rotation)*this.scaleX*x+Math.cos(this.rotation)*this.scaleY*y;
	return new TwoDGeometry.Vector(nx, ny);
}



function breakdownDXFBlock(doc, objectArray, transformation, primitives)
//doc: dxfDocument
//objectArray: az elemek tömbje. Lehet dxfDocument.entities.objects, vagy valamelyik block objects tagja.
//transformation: dxfBlockTransformation
//primitives: array, ide teszi a generált elemeket
{
	for(var i=0; i<objectArray.length; i++)
	{
		var obj=objectArray[i];
		switch(obj.constructor)
		{
			case dxfLine:
				//console.log("LINE");
				primitives.push(new SimpleSection(obj, transformation.transform(obj.x1, obj.y1), transformation.transform(obj.x2, obj.y2)));
				break;
			case dxfCircle:
				//console.log("CIRCLE");
				break;
			case dxfArc:
				//console.log("ARC");
				break;
			case dxfInsert:
				//console.log("INSERT");
				//for(var j=0; j<obj.blockRef.length; j++)
				if(obj.blockRef!=null)
				{
					var t=new dxfBlockTransformation(obj.x, obj.y, obj.scaleX, obj.scaleY, obj.rotation);
					breakdownDXFBlock(doc, obj.blockRef.objects, t, primitives)
				}
				break;
			default:
				//console.log("OTHER");
		}
	}
}

//A rajz DXF elemeiből primitiv elemeket generál, azok tömbjét adja vissza
function breakdownDXFDoc(doc)
{
	var primitiveDrawingElements=[];
	breakdownDXFBlock(doc, doc.entities.objects, new dxfBlockTransformation(), primitiveDrawingElements);
	
	//csak ellenőrzésképpen megjeleníti az elemeket
	var c=canvasControl.getContext('2d');
	for(var i=0; i<primitiveDrawingElements.length; i++)
	{
		primitiveDrawingElements[i].render(c, canvasControl.actualView);
	}
	return primitiveDrawingElements;
}


//****************************
// findAxes
//****************************

//Párhuzmosok középvonalát keresi meg.
//A szakaszt az irányszöggel, a vonal origótól mért távolságával, és a kezdő és végpont paraméterével jellemzem. A párhuzamosoknak azonos az irányszögük. A párhuzamos szakaszok távolsága az origótól mért távolságból könnyen számolható. Így könnyen rendezhetőek és összehasonlíthatóak.

//LESZŰKÍTEM A 160 mm-RE LÉVŐ PÁRHUZAMOSOKRA (REMÉLHETŐLEG IPE 160)

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
		var u=s.p1.minusNew(s.p0).unitVector();
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
	return new TwoDGeometry.Section(new TwoDGeometry.Vector(p0x, p0y), new TwoDGeometry.Vector(p1x, p1y));
};

SectionShadow.prototype.toString=function()
{
	var str="SectionShadow\n";
	str+="   angle = "+this.angle*180/Math.PI+"°\n";
	str+="   arm = "+this.arm+"\n";
	str+="   t0 = "+this.t0+"\n";
	str+="   t1 = "+this.t1+"\n";
	str+="   layer = "+this.layer+"\n";
	return str;
}

