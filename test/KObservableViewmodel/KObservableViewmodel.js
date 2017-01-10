/* Build */
/* End Build */

define(['KObservableData'],function(KData){
    function CreateKObservableViewmodel()
    {
        var _model = KData('Model'),
            _viewmodels = {},
            _ignoreList = ['id','filters','class','sessionStorage','localStorage','store','component'];

        function KObservableViewmodel(node,params,pre,post)
        {
          var name = node.tagName.toLowerCase();

          if(params === undefined) params = [];

          /* Pre -- all about built in data */
          if(pre === undefined) pre = {};
          if(!pre.filters) pre.filters = {};
          if(!pre.sessionStorage) pre.sessionStorage = false;
          if(!pre.localStorage) pre.localStorage = false;
          if(!pre.store) pre.store = false;
          if(!pre.multiple) pre.multiple = false;

          /* post all about post set data and pointers */
          if(post === undefined) post = {};
          /* check pointer refs here */
          var mappedAttrs = [];
          if(node.kb_maps !== undefined)
          {
            mappedAttrs = node.kb_maps.map(function(m){return m.prop});
          }
          for(var x=0,len=node.attributes.length;x<len;x++)
          {
            var attr = node.attributes[x].name,
                mapped = mappedAttrs.indexOf(attr);
            if(mapped !== -1)
            {
              var map = node.kb_maps[mapped],
                  data = node.kb_mapper.kb_viewmodel;
              post[attr] = data.getScope(Object.keys(map.binds)[0].key);
            }
            else
            {
              post[attr] = node.getAttribute(attr);
            }
          }

          return KObservableViewmodel.createViewModel(name,params,pre,post);
        }

        KObservableViewmodel.ignore = function(name)
        {
            if(_ignoreList.indexOf(name) === -1) _ignoreList.push(name);
            return this;
        }

        KObservableViewmodel.unignore = function(name)
        {
            if(_ignoreList.indexOf(name) !== -1) _ignoreList.splice(_ignoreList.indexOf(name),1);
            return this;
        }

        KObservableViewmodel.createViewModel = function(name,params,pre,post)
        {
            if(KObservableViewmodel.isRegistered(name))
            {
                var obsv = KData(name),
                    vm = _viewmodels[name];
                obsv.__proto__ = (vm.prototype !== undefined ? vm.prototype : vm.__proto__);

                if(pre)
                {
                    for(var x=0,keys=Object.keys(pre),len=keys.length;x<len;x++)
                    {
                        if(obsv.isObservable(post,keys[x]))
                        {
                            obsv.addPointer(post,keys[x]);
                        }
                        else
                        {
                            obsv.add(keys[x],post[keys[x]]);
                        }
                    }
                }


                if(typeof vm === 'function')
                {
                    vm.apply(obsv,params);
                    for(var x=0,keys=Object.keys(obsv),len=keys.length;x<len;x++)
                    {
                        if(!obsv.isObservable(obsv,keys[x]))
                        {
                            obsv.set(keys[x],obsv[keys[x]]);
                        }
                    }
                }
                else
                {
                    for(var x=0,keys=Object.keys(vm),len=keys.length;x<len;x++)
                    {
                        if(!obsv.isObservable(vm,keys[x]))
                        {
                            obsv.set(keys[x],vm[keys[x]]);
                        }
                        else
                        {
                            if(obsv[keys[x]]) obsv.remove(keys[x])
                            obsv.addPointer(vm,keys[x]);
                        }
                    }
                }

                if(post)
                {
                    for(var x=0,keys=Object.keys(post),len=keys.length;x<len;x++)
                    {
                        if(obsv.isObservable(post,keys[x]))
                        {
                            if(obsv[keys[x]] !== undefined) obsv.remove(keys[x]);
                            obsv.addPointer(post,keys[x]);
                          
                            /* These link listeners from the current object to the pointer object in the case any are added to it */
                            function linkListeners(action)
                            {
                              if(post[action.type]) post[action.type].call(post,action.args);
                            }

                            obsv.addActionListener('addDataListener',linkListeners)
                            .addActionListener('addDataUpdateListener',linkListeners)
                            .addActionListener('addDataCreateListener',linkListeners)
                            .addActionListener('addDataRemoveListener',linkListeners)
                            .addActionListener('removeDataListener',linkListeners)
                            .addActionListener('removeDataUpdateListener',linkListeners)
                            .addActionListener('removeDataCreateListener',linkListeners)
                            .addActionListener('removeDataRemoveListener',linkListeners)
                          
                        }
                        else
                        {
                            obsv.set(keys[x],post[keys[x]]);
                        }
                    }
                }

                if(obsv.sessionStorage)
                {
                    var storage = sessionStorage.getItem((obsv.id || name));
                    if(storage)
                    {
                        storage = JSON.parse(storage);
                        for(var x=0,keys=Object.keys(storage),len=keys.length;x<len;x++)
                        {
                            obsv.set(keys[x],storage[keys[x]]);
                        }
                    }
                    else
                    {
                        sessionStorage.setItem((obsv.id || name),obsv.stringify());
                    }
                    obsv.addChildDataUpdateListener('*',function(){
                        sessionStorage.setItem((obsv.id || name),obsv.stringify());
                    });
                }

                if(obsv.localStorage)
                {
                    var storage = localStorage.getItem((obsv.id || name));
                    if(storage)
                    {
                        storage = JSON.parse(storage);
                        for(var x=0,keys=Object.keys(storage),len=keys.length;x<len;x++)
                        {
                            obsv.set(keys[x],storage[keys[x]]);
                        }
                    }
                    else
                    {
                        localStorage.setItem((obsv.id || name),obsv.stringify());
                    }
                    obsv.addChildDataUpdateListener('*',function(){
                        localStorage.setItem((obsv.id || name),obsv.stringify());
                    });
                }

                if(obsv.store)
                {
                    _model.set((obsv.id || name),obsv);
                }
                return obsv;
            }
            else
            {
                console.error("There is no viewmodel by the name %o",name);
            }
            return null;
        }

        KObservableViewmodel.isRegistered = function(name)
        {
            return (_viewmodels[name] !== undefined);
        }

        KObservableViewmodel.register = function(name,vm)
        {
            _viewmodels[name] = vm;
            return this;
        }

        KObservableViewmodel.model = function(name)
        {
            return (name ? _model[name] : _model);
        }

        return KObservableViewmodel;
    }
    return CreateKObservableViewmodel;
});
