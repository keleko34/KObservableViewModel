/* Build */
/* End Build */

define(['KObservableData'],function(KData){
    function CreateKObservableViewmodel()
    {
        var _model = KData('Model'),
            _viewmodels = {},
            _ignoreList = ['id','filters','class','sessionStorage','localStorage','store','component'],
            KObservableViewmodel = {};

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
            if(KB_Model.isRegistered(name))
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
