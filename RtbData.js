//****************************************
//RTB DATA
//****************************************
//Copyright: Major, Balazs
//E-mail: majorstructures@gmail.com
//****************************************
//Change history
//2021-03-04	Moved to separate file

//****************************************
//Todo

//****************************************
//Dependencies
// DFXLib.js

//****************************************

//===============================================
// RtbData
//===============================================

function RtbData()
{
	this.fileNameTrunk="";
	this.beamPoints=[];
	this.contourPoints=[];
	this.podestLevels=[];
	this.teilung=null;
	this.lowerConcreteLevel=null;
	this.upperConcreteLevel=null;
	this.mirror=false;
	return this;
}

//------------------------------------------------
RtbData.prototype.render=function(c, view)
{
	let sign=this.mirror?-1:1;
	//beam points
	c.lineWidth=4/view.scale;
	if(this.beamPoints.length>0)
	{
		c.strokeStyle="rgba(255, 0, 0, 0.5)";
		c.fillStyle="rgba(255, 0, 0, 0.5)";
		c.beginPath();
		c.moveTo(sign*this.beamPoints[0].x, this.beamPoints[0].y);
		for(let i=1; i<this.beamPoints.length; i++)
		{
			c.lineTo(sign*this.beamPoints[i].x, this.beamPoints[i].y);
		}
		c.stroke();
		for(let i=0; i<this.beamPoints.length; i++)
		{
			c.beginPath();
			c.arc(sign*this.beamPoints[i].x, this.beamPoints[i].y, 3/view.scale, 0, 2*Math.PI, true);
			c.stroke();
			c.save();
			c.translate(sign*this.beamPoints[i].x, this.beamPoints[i].y);
			c.scale(1, -1);
			c.font=("50px sans-serif");
			c.textBaseline="middle";
			c.fillText("("+i+") "+this.beamPoints[i].type, 5/view.scale, 0);
			c.restore();
		}
	}
	
	//concrete contour
	if(this.contourPoints.length>0)
	{
		c.strokeStyle="none";
		c.fillStyle="rgba(0, 200, 0, 0.5)";
		c.beginPath();
		c.moveTo(sign*this.contourPoints[0].x, this.contourPoints[0].y);
		for(let i=1; i<this.contourPoints.length; i++)
		{
			c.lineTo(sign*this.contourPoints[i].x, this.contourPoints[i].y);
		}
		c.closePath();
		c.fill();
	}
	
	//podest levels
	c.fillStyle="none";
	c.strokeStyle="rgba(127, 127, 255, 0.9)";
	c.lineWidth=1/view.scale;
	c.beginPath();
	for(let i=0; i<this.podestLevels.length; i++)
	{
		c.moveTo(sign*25000, this.podestLevels[i]);
		c.lineTo(0, this.podestLevels[i]);
	}
	c.stroke();
	
	//concrete pressure boundaries
	c.fillStyle="none";
	c.strokeStyle="rgba(255, 255, 0, 0.9)";
	c.lineWidth=1/view.scale;
	c.beginPath();
	c.moveTo(sign*25000, this.lowerConcreteLevel);
	c.lineTo(0, this.lowerConcreteLevel);
	c.moveTo(sign*25000, this.upperConcreteLevel);
	c.lineTo(0, this.upperConcreteLevel);
	c.stroke();
	console.log("rtbData.render ends\n");
};

//....................................................................................................

//This is very classic extractor
//The beam axis will be determined by the insertion points of the text entities.
//Even points with code >1 will be used for beam axis definition
RtbData.prototype.extractFrom=function(drawing)
{
	let collectedBeamPoints=[];
	let collectedSectionLevels=[];
	//a blokkokban nem keres egyenlőre
	for(let i=0; i<drawing.entities.objects.length; i++)
	{
		let x=drawing.entities.objects[i];
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
					
					let point=new TwoDGeometry.Vector(Math.abs(x.x), x.y);
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
	if(collectedBeamPoints.length==0) console.log("Warning: No beam points found!\n");
	if(collectedBeamPoints.length>0 && collectedBeamPoints.length<3) console.log("Warning: Only "+collectedBeamPoints.length+" beam points found!\n");
	if(this.contourPoints.length==0) console.log("Warning: No concrete contour points found!\n");
	if(this.contourPoints.length>0 && this.contourPoints.length<3) console.log("Warning: Only "+this.contourPoints.length+" concrete contour points found!\n");
	if(this.podestLevels.length==0) console.log("Warning: No podest levels found!\n");
	if(collectedSectionLevels.length==0) console.log("Warning: No concreting section limits found!\n");
	if(collectedSectionLevels.length==1) console.log("Warning: Only one concreting section limits found! (Two required)\n");
	if(collectedSectionLevels.length>2) console.log("Warning: Two much concreting section limits found! ("+collectedSectionLevels.length+" instead of two)\n");
	if(this.teilung==null || this.teilung==Math.NaN) console.log("Warning: No beam number information (Teilung) found!\n");
	
	//tartó pontok száma
	let n=collectedBeamPoints.length;
	if(n>1)
	{
		//használt pontok nyilvántartása
		let pointUsed=[];
		for(let i=0; i<n; i++)
		{
			pointUsed[i]=false;
		}
		
		//legnagyobb távolság, mint kiinduló érték
		let maxDist2=0;
		for(let j=0; j<n-1; j++)
		{
			for(let i=j+1; i<n; i++)
			{
				let dist2=Math.pow(collectedBeamPoints[i].x-collectedBeamPoints[j].x, 2)+Math.pow(collectedBeamPoints[i].y-collectedBeamPoints[j].y, 2);
				if(dist2>maxDist2)
				{
					maxDist2=dist2;
				}
			}
		}
		//megkeressük a legkisebb távolsághoz tartozó pontokat
		let choosenI=null;
		let choosenJ=null;
		let minDist2=maxDist2;
		for(let j=0; j<n-1; j++)
		{
			for(let i=j+1; i<n; i++)
			{
				let dist2=Math.pow(collectedBeamPoints[i].x-collectedBeamPoints[j].x, 2)+Math.pow(collectedBeamPoints[i].y-collectedBeamPoints[j].y, 2);
				if(dist2<=minDist2)
				{
					minDist2=dist2;
					choosenI=i;
					choosenJ=j;
				}
			}
		}

		//hozzáadom a kiválasztott pontokat a this.beamPoints-hoz
		let x=new TwoDGeometry.Vector(Math.abs(collectedBeamPoints[choosenI].x), collectedBeamPoints[choosenI].y);
		x.type=parseInt(collectedBeamPoints[choosenI].text);
		this.beamPoints.push(x);
		pointUsed[choosenI]=true;
		x=new TwoDGeometry.Vector(Math.abs(collectedBeamPoints[choosenJ].x), collectedBeamPoints[choosenJ].y);
		x.type=parseInt(collectedBeamPoints[choosenJ].text);
		this.beamPoints.push(x);
		pointUsed[choosenJ]=true;
		this.mirror=collectedBeamPoints[0].x<0?true:false;
		
		//(n-2)-ször lejátszom, mert még ennyi pontot kell hozzáadni a this.beamPoints-hoz
		for(let j=0; j<n-2; j++)
		{
			let minDist2_s=maxDist2;
			let choosenI_s=null;
			let minDist2_e=maxDist2;
			let choosenI_e=null;
			for(let i=0; i<n; i++)
			{
				if(!pointUsed[i])
				{
					let dist2_s=Math.pow(this.beamPoints[0].x-Math.abs(collectedBeamPoints[i].x), 2)+Math.pow(this.beamPoints[0].y-collectedBeamPoints[i].y, 2);
					if(dist2_s<=minDist2_s)
					{
						minDist2_s=dist2_s;
						choosenI_s=i;
					}
					let dist2_e=Math.pow(this.beamPoints[j+1].x-Math.abs(collectedBeamPoints[i].x), 2)+Math.pow(this.beamPoints[j+1].y-collectedBeamPoints[i].y, 2);
					if(dist2_e<=minDist2_e)
					{
						minDist2_e=dist2_e;
						choosenI_e=i;
					}
				}
			}
			if(minDist2_s<minDist2_e)
			{
				let x=new TwoDGeometry.Vector(Math.abs(collectedBeamPoints[choosenI_s].x), collectedBeamPoints[choosenI_s].y);
				x.type=parseInt(collectedBeamPoints[choosenI_s].text);
				this.beamPoints.unshift(x);
				pointUsed[choosenI_s]=true;
			}
			else
			{
				let x=new TwoDGeometry.Vector(Math.abs(collectedBeamPoints[choosenI_e].x), collectedBeamPoints[choosenI_e].y);
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

//This a somewhat advanced extractor.
//The beam axis will be constructed from points with code <10.
//Points with code 12, 13, 14, 15 will be projected on the axis horizontally.
//On long beam sections intermediate points will be inserted
RtbData.prototype.extractWithProjectionFrom=function(drawing)
{
	//a geometriai pontokat és az egyebeket külön kell szedni,
	//a geometriai végigcsinálni, amit az előzőben,
	//a többi pontot rávetíteni a tartótengelyre
	
	let collectedGeometryPoints=[]; //0...9
	let collectedMarkerPoints=[]; //az összes többi
	//let collectedPodestLevels=[];
	let collectedSectionLevels=[];
	//a blokkokban nem keres egyenlőre
	for(let i=0; i<drawing.entities.objects.length; i++)
	{
		let x=drawing.entities.objects[i];
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
					
					let point=new TwoDGeometry.Vector(Math.abs(x.x), x.y);
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
	if(collectedGeometryPoints.length==0) console.log("Warning: No beam geometry points found!\n");
	if(collectedGeometryPoints.length>0 && collectedGeometryPoints.length<3) console.log("Warning: Only "+collectedGeometryPoints.length+" beam geometry point(s) found!\n");
	if(this.contourPoints.length==0) console.log("Warning: No concrete contour points found!\n");
	if(this.contourPoints.length>0 && this.contourPoints.length<3) console.log("Warning: Only "+this.contourPoints.length+" concrete contour points found!\n");
	if(this.podestLevels.length==0) console.log("Warning: No podest levels found!\n");
	if(collectedSectionLevels.length==0) console.log("Warning: No concreting section limits found!\n");
	if(collectedSectionLevels.length==1) console.log("Warning: Only one concreting section limits found! (Two required)\n");
	if(collectedSectionLevels.length>2) console.log("Warning: Two much concreting section limits found! ("+collectedSectionLevels.length+" instead of two)\n");
	if(this.teilung==null || this.teilung==Math.NaN) console.log("Warning: No beam number information (Teilung) found!\n");
	
	//tartó pontok száma
	let n=collectedGeometryPoints.length;
	if(n>1)
	{
		//használt pontok nyilvántartása
		let pointUsed=[];
		for(let i=0; i<n; i++)
		{
			pointUsed[i]=false;
		}
		
		//legnagyobb távolság, mint kiinduló érték
		let maxDist2=0;
		for(let j=0; j<n-1; j++)
		{
			for(let i=j+1; i<n; i++)
			{
				let dist2=Math.pow(collectedGeometryPoints[i].x-collectedGeometryPoints[j].x, 2)+Math.pow(collectedGeometryPoints[i].y-collectedGeometryPoints[j].y, 2);
				if(dist2>maxDist2)
				{
					maxDist2=dist2;
				}
			}
		}
		//megkeressük a legkisebb távolsághoz tartozó pontokat
		let choosenI=null;
		let choosenJ=null;
		let minDist2=maxDist2;
		for(let j=0; j<n-1; j++)
		{
			for(let i=j+1; i<n; i++)
			{
				let dist2=Math.pow(collectedGeometryPoints[i].x-collectedGeometryPoints[j].x, 2)+Math.pow(collectedGeometryPoints[i].y-collectedGeometryPoints[j].y, 2);
				if(dist2<=minDist2)
				{
					minDist2=dist2;
					choosenI=i;
					choosenJ=j;
				}
			}
		}

		//hozzáadom a kiválasztott pontokat a this.beamPoints-hoz
		let x=new TwoDGeometry.Vector(Math.abs(collectedGeometryPoints[choosenI].x), collectedGeometryPoints[choosenI].y);
		x.type=parseInt(collectedGeometryPoints[choosenI].text);
		this.beamPoints.push(x);
		pointUsed[choosenI]=true;
		x=new TwoDGeometry.Vector(Math.abs(collectedGeometryPoints[choosenJ].x), collectedGeometryPoints[choosenJ].y);
		x.type=parseInt(collectedGeometryPoints[choosenJ].text);
		this.beamPoints.push(x);
		pointUsed[choosenJ]=true;
		this.mirror=collectedGeometryPoints[0].x<0?true:false;
		
		//(n-2)-ször lejátszom, mert még ennyi pontot kell hozzáadni a this.beamPoints-hoz
		for(let j=0; j<n-2; j++)
		{
			let minDist2_s=maxDist2;
			let choosenI_s=null;
			let minDist2_e=maxDist2;
			let choosenI_e=null;
			for(let i=0; i<n; i++)
			{
				if(!pointUsed[i])
				{
					let dist2_s=Math.pow(this.beamPoints[0].x-Math.abs(collectedGeometryPoints[i].x), 2)+Math.pow(this.beamPoints[0].y-collectedGeometryPoints[i].y, 2);
					if(dist2_s<=minDist2_s)
					{
						minDist2_s=dist2_s;
						choosenI_s=i;
					}
					let dist2_e=Math.pow(this.beamPoints[j+1].x-Math.abs(collectedGeometryPoints[i].x), 2)+Math.pow(this.beamPoints[j+1].y-collectedGeometryPoints[i].y, 2);
					if(dist2_e<=minDist2_e)
					{
						minDist2_e=dist2_e;
						choosenI_e=i;
					}
				}
			}
			if(minDist2_s<minDist2_e)
			{
				let x=new TwoDGeometry.Vector(Math.abs(collectedGeometryPoints[choosenI_s].x), collectedGeometryPoints[choosenI_s].y);
				x.type=parseInt(collectedGeometryPoints[choosenI_s].text);
				this.beamPoints.unshift(x);
				pointUsed[choosenI_s]=true;
			}
			else
			{
				let x=new TwoDGeometry.Vector(Math.abs(collectedGeometryPoints[choosenI_e].x), collectedGeometryPoints[choosenI_e].y);
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
	for(let i=0; i<collectedMarkerPoints.length; i++)
	{
		for(let j=0; j<this.beamPoints.length-1; j++)
		{
			if(this.beamPoints[j].y==collectedMarkerPoints[i].y)
			{
				if(this.beamPoint[j].type==0)
				{
					let x=new TwoDGeometry.Vector(Math.abs(collectedMarkerPoints[i].x), collectedMarkerPoints[i].y);
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
				let xx=Math.abs(this.beamPoints[j].x)+(this.beamPoints[j+1].x-this.beamPoints[j].x)/(this.beamPoints[j+1].y-this.beamPoints[j].y)*(collectedMarkerPoints[i].y-this.beamPoints[j].y);
				let x=new TwoDGeometry.Vector(xx, collectedMarkerPoints[i].y);
				x.type=parseInt(collectedMarkerPoints[i].text)-10;
				this.beamPoints.splice(j+1, 0, x);
				break;
			}
		}
		if(this.beamPoints[this.beamPoints.length-1].y==collectedMarkerPoints[i].y)
		{
			if(this.beamPoints[this.beamPoints.length-1].type==0)
			{
				let x=new TwoDGeometry.Vector(Math.abs(collectedMarkerPoints[i].x), collectedMarkerPoints[i].y);
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
	let maxDistanceAllowed=500;
	//végig megyek a szakaszokon
	//kicsit kakás, mert a this.beamPoint hosszát változtatom azzal, hogy újabb pontokat szúrok be
	for(let i=0; i<this.beamPoints.length-1; i++)
	{
		//az aktuális pont távolsága a következőtől
		let distance=this.beamPoints[i].distance(this.beamPoints[i+1]);
		if(distance>maxDistanceAllowed)
		{
			//ennyi részre kell felosztani a szakaszt
			let k=Math.ceil(distance/maxDistanceAllowed);
			let dx=(this.beamPoints[i+1].x-this.beamPoints[i].x)/k;
			let dy=(this.beamPoints[i+1].y-this.beamPoints[i].y)/k;
			//beszúrjuk az új pontokat
			for(let j=1; j<k; j++)
			{
				let x=new TwoDGeometry.Vector(this.beamPoints[i].x+j*dx, this.beamPoints[i].y+j*dy);
				x.type=0;
				this.beamPoints.splice(i+j, 0, x);
			}
			i+=k-1;
		}
	}
	
	//közeli pontok eltávolítása
	let minDistanceAllowed=40;
	for(let i=0; i<this.beamPoints.length-1; i++)
	{
		//az aktuális pont távolsága a következőtől
		let distance=this.beamPoints[i].distance(this.beamPoints[i+1]);
		if(distance<minDistanceAllowed)
		{
			let isLowerPointImportant=(this.beamPoints[i].type>0 || i==0);
			let isUpperPointImportant=(this.beamPoints[i+1].type>0 || i==this.beamPoints.length-1);
			if(isLowerPointImportant)
			{
				if(isUpperPointImportant)
				//mindkét pontot meg kell tartani
				{
					console.log("Points "+i+" and "+(i+1)+" are too near to each other, but none of them can be removed!\n");
				}
				else
				//a felső pont kidobható
				{
					this.beamPoints.splice(i+1, 1);
					//console.log("Point "+(i+1)+" removed.\n");
					i--;
				}
			}
			else
			{
				if(isUpperPointImportant)
				//az alsó pont kidobható
				{
					this.beamPoints.splice(i, 1);
					//console.log("Point "+i+" removed.\n");
					i--;
				}
				else
				//bármelyik kidobható, kérdés, hogy melyik legyen az
				{
					this.beamPoints.splice(i, 1);
					//console.log("Point "+i+" removed.\n");
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

//....................................................................................................

//Extractor using polylines
//The beam axis is defined by an polyline (LWPOLYLINE) on the layer "traeger"
//The polyline has to start at the lower end of the beam
//Points with code 1, 2, 3, 4, 5 will be projected on the axis horizontally.
//Close geometry points will be removed
//On long beam sections intermediate points will be inserted
//The concrete contour is defined also as a polyline
RtbData.prototype.extractWithPolygonFrom=function(drawing)
{
	//layer names
	const beamLayer="traeger";
	const concreteContourLayer="beton";
	const platformLevelsLayer="podeste";
	const miscellaneosDataLayer="diverse";
	
	let collectedBeamPolygons=[];
	let collectedConcreteContourPolygons=[];
	let collectedMarkerPoints=[]; //az összes többi
	let collectedPodestLevels=[];
	let collectedSectionLevels=[];
	//does not search in blocks
	for(let i=0; i<drawing.entities.objects.length; i++)
	{
		let x=drawing.entities.objects[i];
		switch(x.layer.toLowerCase())
		{
			case beamLayer:
				if(x.type=="TEXT")
				{
					collectedMarkerPoints.push(x);
				}
				else if(x.type=="LWPOLYLINE")
				{
					collectedBeamPolygons.push(x);
				}
				break;
			case concreteContourLayer:
				if(x.type=="LWPOLYLINE")
				{
					collectedConcreteContourPolygons.push(x);
				}
				break;
			case platformLevelsLayer:
				if(x.type=="POINT")
				{
					this.podestLevels.push(x.y);
				}
				break;
			case miscellaneosDataLayer:
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
	//warnings
	if(collectedBeamPolygons.length==0) console.log("Warning: No beam axis polygon found!\n");
	if(collectedBeamPolygons.length>1) console.log("Warning: More then one beam axis polygon found!\n");
	if(collectedMarkerPoints.length==0) console.log("Warning: No rings found!\n");
	if(collectedConcreteContourPolygons.length==0) console.log("Warning: No concrete contour polygon found!\n");
	if(collectedConcreteContourPolygons.length>1) console.log("Warning: More then one concrete contour polygon found!\n");
	if(this.podestLevels.length==0) console.log("Warning: No podest levels found!\n");
	if(collectedSectionLevels.length==0) console.log("Warning: No concreting section limits found!\n");
	if(collectedSectionLevels.length==1) console.log("Warning: Only one concreting section limits found! (Two required)\n");
	if(collectedSectionLevels.length>2) console.log("Warning: Two much concreting section limits found! ("+collectedSectionLevels.length+" instead of two)\n");
	if(this.teilung==null || this.teilung==Math.NaN) console.log("Warning: No beam number information (Teilung) found!\n");

	//Add polygon point to beam points list
	let n=Math.min(collectedBeamPolygons[0].x.length, collectedBeamPolygons[0].y.length);
	for(let i=0; i<n; i++)
	{
		let x=new TwoDGeometry.Vector(Math.abs(collectedBeamPolygons[0].x[i]), collectedBeamPolygons[0].y[i]);
		x.type=0;
		this.beamPoints.push(x);
	}
	//rávetítem a marker pontokat a tartó geometriára
	for(let i=0; i<collectedMarkerPoints.length; i++)
	{
		for(let j=0; j<this.beamPoints.length-1; j++)
		{
			if(this.beamPoints[j].y==collectedMarkerPoints[i].y)
			{
				if(this.beamPoint[j].type==0)
				{
					let x=new TwoDGeometry.Vector(Math.abs(collectedMarkerPoints[i].x), collectedMarkerPoints[i].y);
					let t=parseInt(collectedMarkerPoints[i].text);
					x.type=(t<10?t:(t-10));
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
				let xx=Math.abs(this.beamPoints[j].x)+(this.beamPoints[j+1].x-this.beamPoints[j].x)/(this.beamPoints[j+1].y-this.beamPoints[j].y)*(collectedMarkerPoints[i].y-this.beamPoints[j].y);
				let x=new TwoDGeometry.Vector(xx, collectedMarkerPoints[i].y);
				let t=parseInt(collectedMarkerPoints[i].text);
				x.type=(t<10?t:(t-10));
				this.beamPoints.splice(j+1, 0, x);
				break;
			}
		}
		if(this.beamPoints[this.beamPoints.length-1].y==collectedMarkerPoints[i].y)
		{
			if(this.beamPoints[this.beamPoints.length-1].type==0)
			{
				let x=new TwoDGeometry.Vector(Math.abs(collectedMarkerPoints[i].x), collectedMarkerPoints[i].y);
				let t=parseInt(collectedMarkerPoints[i].text);
				x.type=(t<10?t:(t-10));
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
	let maxDistanceAllowed=500;
	let newBeamPoints=[];
	//végig megyek a szakaszokon
	//kicsit kakás, mert a this.beamPoint hosszát változtatom azzal, hogy újabb pontokat szúrok be
	for(let i=0; i<this.beamPoints.length-1; i++)
	{
		newBeamPoints.push(this.beamPoints[i]);
		//az aktuális pont távolsága a következőtől
		let distance=this.beamPoints[i].distance(this.beamPoints[i+1]);
		if(distance>maxDistanceAllowed)
		{
			//ennyi részre kell felosztani a szakaszt
			let k=Math.ceil(distance/maxDistanceAllowed);
			let dx=(this.beamPoints[i+1].x-this.beamPoints[i].x)/k;
			let dy=(this.beamPoints[i+1].y-this.beamPoints[i].y)/k;
			//beszúrjuk az új pontokat
			for(let j=1; j<k; j++)
			{
				let x=new TwoDGeometry.Vector(this.beamPoints[i].x+j*dx, this.beamPoints[i].y+j*dy);
				x.type=0;
				newBeamPoints.push(x);
			}
		}
	}
	newBeamPoints.push(this.beamPoints[this.beamPoints.length-1]);
	this.beamPoints=newBeamPoints;
	
	//közeli pontok eltávolítása
	let minDistanceAllowed=40;
	for(let i=0; i<this.beamPoints.length-1; i++)
	{
		//az aktuális pont távolsága a következőtől
		let distance=this.beamPoints[i].distance(this.beamPoints[i+1]);
		if(distance<minDistanceAllowed)
		{
			let isLowerPointImportant=(this.beamPoints[i].type>0 || i==0);
			let isUpperPointImportant=(this.beamPoints[i+1].type>0 || i==this.beamPoints.length-1);
			if(isLowerPointImportant)
			{
				if(isUpperPointImportant)
				//mindkét pontot meg kell tartani
				{
					console.log("Points "+i+" and "+(i+1)+" are too near to each other, but none of them can be removed!\n");
				}
				else
				//a felső pont kidobható
				{
					this.beamPoints.splice(i+1, 1);
					//console.log("Point "+(i+1)+" removed.\n");
					i--;
				}
			}
			else
			{
				if(isUpperPointImportant)
				//az alsó pont kidobható
				{
					this.beamPoints.splice(i, 1);
					//console.log("Point "+i+" removed.\n");
					i--;
				}
				else
				//bármelyik kidobható, kérdés, hogy melyik legyen az
				{
					this.beamPoints.splice(i, 1);
					//console.log("Point "+i+" removed.\n");
					i--;
				}
			}

		}
	}
	
	n=Math.min(collectedConcreteContourPolygons[0].x.length, collectedConcreteContourPolygons[0].y.length);
	for(let i=0; i<collectedConcreteContourPolygons[0].length; i++)
	{
		collectedConcreteContourPolygons.push(x);
		let point=new TwoDGeometry.Vector(Math.abs(collectedConcreteContourPolygons[0].x[i]), ollectedConcreteContourPolygons[0].y[i]);
		this.contourPoints.push(point);
	}
	
	this.podestLevels.sort(function(a, b){return a - b;});
	collectedSectionLevels.sort(function(a, b){return a - b;});
	this.lowerConcreteLevel=collectedSectionLevels[0];
	this.upperConcreteLevel=collectedSectionLevels[collectedSectionLevels.length-1];
};


//****************************
// loadFromXml
//****************************

RtbData.prototype.loadFromXml=function(xml)
{
}

//****************************
// toXml
//****************************

RtbData.prototype.toXml=function()
{
	let xml=document.implementation.createDocument (null, "rtbdata", null);
	let str;
	let node;
	
	node=xml.createElement("nofbeams");
	xml.documentElement.appendChild(node);
	node.textContent=this.teilung;
	//
	node=xml.createElement("lowerconcretelevel");
	xml.documentElement.appendChild(node);
	node.textContent=(this.lowerConcreteLevel/1000).toPrecision(5);
	//
	node=xml.createElement("upperconcretelevel");
	xml.documentElement.appendChild(node);
	node.textContent=(this.upperConcreteLevel/1000).toPrecision(5);
	//
	node=xml.createElement("beampoints");
	xml.documentElement.appendChild(node);
	str="";
	for(let i=0; i<this.beamPoints.length; i++)
	{
		let p=this.beamPoints[i];
		str+=(p.x/1000).toFixed(5)+"\t"+(p.y/1000).toFixed(5)+"\t"+p.type;
		if(p.type==2) str+=" //DGL";
		if(p.type==3) str+=" //ZGL";
		if(p.type==4) str+=" //ZGL";
		str+="\n";
	}
	node.textContent=str;
	//
	node=xml.createElement("contourpoints");
	xml.documentElement.appendChild(node);
	str="";
	for(let i=0; i<this.contourPoints.length; i++)
	{
		let p=this.contourPoints[i];
		str+=(p.x/1000).toFixed(5)+"\t"+(p.y/1000).toFixed(5)+"\n";
	}
	node.textContent=str;
	//
	node=xml.createElement("podestlevels");
	xml.documentElement.appendChild(node);
	str="";
	for(let i=0; i<this.podestLevels.length; i++)
	{
		let y=this.podestLevels[i];
		str+=(y/1000).toFixed(5)+"\n";
	}
	node.textContent=str;
	//
	node=xml.createElement("podestlevels");
	xml.documentElement.appendChild(node);
	str="";
	for(let i=0; i<this.podestLevels.length; i++)
	{
		let y=this.podestLevels[i];
		str+=(y/1000).toFixed(5)+"\n";
	}
	node.textContent=str;
	
	return xml;
}

