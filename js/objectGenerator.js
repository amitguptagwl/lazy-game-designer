define(function (require) {
    
    var makeDraggable = require('./draggable');

    let counter = 0;
    let playground = document.getElementById('playground');
    let objectDefs = new Map();
    let objects = [];


    let gameObjectBase = {

        changeVisState: function(arr, state) {
            for (obj of arr) {
                obj.style.visibility = state ? 'visible' : 'hidden';
            }
        },

        flip:function() {
            this.showFront = !this.showFront;
            if ( this.showFront) {
                this.changeVisState(this.front_objects, true);
                this.changeVisState(this.back_objects, false);      
                this.div.classList.remove('cardBack');
            }
            else {
                this.changeVisState(this.front_objects, false);
                this.changeVisState(this.back_objects, true);
                this.div.classList.add('cardBack');                  
            }
        }
    };

    let stackBase = {
        objects:[],
        front:undefined,
        placeOnTop:function(obj) {
            this.objects.push(obj);

            if ( this.front !== undefined) {
                this.front.div.style.visibility = 'hidden';
            }
            this.front = obj;

            this.div.appendChild(obj.div);

        },
        detachTop:function() {
              
            let detachObj = this.objects.pop();
           
            if ( detachObj !== undefined) {
                playground.appendChild(detachObj.div);   
                if (this.flipped) detachObj.flip(); 
                detachObj.div.style.top = this.div.style.top;
                detachObj.div.style.left = this.div.style.left;   
            }
            if ( this.objects.length > 0) {
                this.front = this.objects[this.objects.length-1];
                this.front.div.style.visibility = 'visible';   
        
            }
            return detachObj; 
        }
    };

    let getObjectById = function(id) {
        for (obj of objects)
            if( obj.id === id)
                return obj;
        return undefined;
    };

    //let createElement = function 

    let createElement = function(data, sub) {
        let obj = undefined;      
        sub = sub ||{};
        if ( el.type === 'symbol' ||el.type === 'text') {
            obj = document.createElement('div');
            obj.style.position = 'absolute'
            obj.style.fontSize = sub.size || data.size;
            obj.style.left = sub.x || data.x;    
            obj.style.top = sub.y || data.y;             
            obj.style.color = sub.color || data.color || 'black';
            obj.innerHTML = sub.value || data.value;   
            obj.className = 'unselectable symbol';
        }
        else if ( el.type === 'text') {

        }
        return obj;
    };

    let createBaseObject = function(base, content, noContent = false) {

        let newObject = undefined;
        front = [];
        back = [];

        /// get template
        let templ = objectDefs.get(base);
        if ( templ !== undefined) {
            // create from base! (front)
            newObject = document.createElement('div'); 

            newObject.className = 'dragtest unselectable';
            newObject.style.width = templ.size.w;
            newObject.style.height = templ.size.h;  

            if (noContent === false) {
                for (el of templ.elements) {

                    // look for overwriting data!
                    let data = undefined;
                    for( dat of content.data) {
                        if ( dat.name === el.name)
                            data = dat;
                    }

                    let sub = createElement(el, data);
                    if (sub !== undefined)
                    newObject.appendChild(sub);
                    front.push(sub);
                } 
            }

            // create backside              
            //back = document.createElement('div');     
            //back.className = 'dragtest unselectable pattern1';
            //back.style.width = templ.size.w;
            //back.style.height = templ.size.h;  
            //front.appendChild(back);
        }
        else {

        }

/*
        else if ( base === "chip") {
            
            obj = document.createElement('div');
            obj.className = 'dragtest unselectable circleBase';
            obj.style.width = 100;
            obj.style.height = 100;

        }  
        */

        if (newObject) {
            newObject.style.position = 'absolute';          
            playground.appendChild(newObject);
        }
        return [newObject,front,back];
    };

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min +1)) + min; 
    }    

    ////// Public interface //////
    return {

        registerObject: function(def) {
            objectDefs.set(def.type, def);
        },

        createCardStack :function(types, data) {
            let newStack = Object.create(stackBase);
            newStack.allowedTypes = types;
            newStack.name = `FieldObject_${counter++}`;
            newStack.id = counter;
            newStack.flipped = data.flipped ? true : false;
            objects.push(newStack);

            let [obj3] = createBaseObject( types[0],{}, true );
            let [obj2] = createBaseObject( types[0],{}, true );
            let [obj1] = createBaseObject( types[0],{}, true );            
            obj1.appendChild(obj2).appendChild(obj3);
            obj2.style.top = obj2.style.left = 5;
            obj3.style.top = obj3.style.left = 5;
            newStack.div = obj1;

            obj3.className += " dark";
            obj2.className += " dark";
            obj1.className += " dark";

            newStack.div.style.top = data.y || 0;
            newStack.div.style.left = data.x || 0;
            newStack.div.style.transform = `rotate(${getRandomInt(-5,5)}deg)`;

            var menu = [{
                name:  "Draw card",
                title: 'create button',
                fun: function () {

                    let detObj = newStack.detachTop();                                
                    if ( detObj ) makeDraggable(detObj.div);  
                    
                }
            }, {
                name: 'update',
                title: 'update button'
            }, {
                name: 'delete',
                title: 'create button',
            }];
            //Calling context menu
            $(newStack.div).contextMenu(menu,{
                triggerOn:'contextmenu'
            });

            makeDraggable(newStack.div);  

            return newStack;
        },

        createObject: function (data) {
       
            let container = Object.create(gameObjectBase); // todo: inherent from some base?
            container.front_objects = [];
            container.back_objects = [];  
            container.showFront = true;


            let [newObject,front,back] = createBaseObject(data.type, data);
            container.front_objects = front;
            container.back_objects = back;

            container.div = newObject;
            container.name = `FieldObject_${counter++}`;
            container.id = counter;
            objects.push(container);            

            newObject.style.top = data.y || 0;
            newObject.style.left = data.x || 0;
            newObject.style.transform = `rotate(${getRandomInt(-5,5)}deg)`;

            var menu = [{
                name:  newObject.id,
                title: 'create button',
                fun: function () {

                    $('.dragtest').css("zIndex",99);
                    $(newObject).css('zIndex', 100);
                    //alert('i am add button')
                }
            }, {
                name: 'Flip',
                title: 'Flip card',
                fun: function() {
                    container.flip();
                }
            }, {
                name: 'delete',
                title: 'create button',
            }];
        
            //Calling context menu
            $(newObject).contextMenu(menu,{
                triggerOn:'contextmenu'
            });
            //Calling context menu
            //$('body').contextMenu(menu,{triggerOn:'contextmenu'});    


            // should this object be stacked onto something?
            if ( data.stack !== undefined) {
                let obj = getObjectById(data.stack);
                if ( obj !== undefined) {
                    //console.log("stack onto:" + obj.id);
                    /// Object will now be HIDDEN!
                    if (obj.flipped)
                        container.flip();
                    obj.placeOnTop(container);

                }
            }
            else {
                makeDraggable(container.div);                
            }

            return container;
        }
    };
});