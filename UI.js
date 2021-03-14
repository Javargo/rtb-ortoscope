console.log("UI 1");

function UI()
{
	this.paintDiv=document.getElementById("paint_div");
	this.paintArea=document.getElementById("paint_area");
	this.bottomBar=document.getElementById("bottom_bar");
	this.drawings=[];
	this.rtbData=null;
	this.view=new ViewProperties();
	this.panEventStarted=false;
	this.mouseDownX=null;
	this.mouseDownY=null;
	this.paintArea.addEventListener("wheel", e=>
	{
		let localScreenX=e.x-e.target.offsetLeft-e.target.clientLeft;
		let localScreenY=e.y-e.target.offsetTop-e.target.clientTop;
		let rescaleFactor=(1-e.deltaY/3*0.25);
		this.view.scale*=rescaleFactor;
		this.view.x=localScreenX-rescaleFactor*(localScreenX-this.view.x);
		this.view.y=localScreenY-rescaleFactor*(localScreenY-this.view.y);
		this.renderAll();
	});
	this.paintArea.addEventListener("mousedown", e=>
	{
		this.mouseDownX=e.x;
		this.mouseDownY=e.y;
		this.panStarted=true;
	});
	this.paintArea.addEventListener("mouseup", e=>
	{
		let mouseDeltaX=e.x-this.mouseDownX;
		let mouseDeltaY=e.y-this.mouseDownY;
		this.view.pan(mouseDeltaX, mouseDeltaY); //????????
		this.panStarted=false;
		this.renderAll();
	});
	this.paintArea.addEventListener("mousemove", e=>
	{
		if(this.panStarted==true)
		{
			let mouseDeltaX=e.x-this.mouseDownX;
			let mouseDeltaY=e.y-this.mouseDownY;
			this.mouseDownX=e.x;
			this.mouseDownY=e.y;
			this.view.pan(mouseDeltaX, mouseDeltaY);
			this.renderAll();
		}
	});
	this.paintArea.addEventListener("mouseout", e=>
	{
		this.panStarted=false;
	});
	return this;
}


UI.prototype.resizePaintArea=function(e)
{
	this.paintArea.width=this.paintDiv.clientWidth;
	this.paintArea.height=this.paintDiv.clientHeight;
	this.renderAll();
}

UI.prototype.renderAll=function()
{
	let context=this.paintArea.getContext('2d');
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.fillStyle = "white";
	context.fillRect(0, 0, this.paintArea.width, this.paintArea.height);
	for(let i=0; i<this.drawings.length; i++)
	{
		this.drawings[i].render(context, this.view);
	}
}

UI.prototype.loadDxfButtonCommand=function(e)
{
	let fr=new FileReader();
	fr.addEventListener("load", e=>
	{
		this.drawings.length=0;
		let drawing=new DxfDocument(e.target.result);
		this.drawings.push(drawing);
		this.view.centerDrawingOnCanvas(drawing, this.paintArea);
		this.resizePaintArea();		
	});
	fr.readAsText(e.target.files[0]);
	this.bottomBar.textContent=e.target.files[0].name;
}

UI.prototype.scanRtbButtonCommand=function(e)
{
	if(this.drawings.length>0)
	{
		let s=new RtbData();
		s.extractFrom(this.drawings[0]);
		/*let serializer=new XMLSerializer();
		let str=serializer.serializeToString(s.toXml());
		console.log(str);*/
		this.drawings.push(s);
		this.rtbData=s;
		this.renderAll();
	}
}

UI.prototype.saveRtbButtonCommand=function(e)
{
	console.log("Save starts");
	let serializer = new XMLSerializer();
	let str="<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
	//str+="<?xml-stylesheet type=\"text/xsl\" href=\"subco_contract_template.xsl\"?>";
	str+=serializer.serializeToString(this.rtbData.toXml());
	let a=document.createElement("a");
	a.href="echo?"+encodeURI(str);
	a.download="data.xml"; //suggest a content specific name!
	a.target="_blank";
	a.hidden=true;
	document.body.appendChild(a);
	a.click();
}

