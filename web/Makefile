BOOTSTRAP_SRC=public/components/bootstrap-stylus
BOOTSTRAP_STYLUS=$(BOOTSTRAP_SRC)/bootstrap/%.styl $(BOOTSTRAP_SRC)/bootstrap/mixins/%.styl

.PHONY: default build_resources clean clobber \
bootstrap_resources clean_bootstrap clobber_bootstrap

#bower:
#	bower install
#
#bower_bootstrap: bower

default: build_resources

build_resources: bootstrap_resources

clean: clean_bootstrap

clobber: clobber_bootstrap

#
# ### bootstrap ###
#

.got.bower.bootstrap:
	bower -q install
	touch .got.bower.bootstrap

$(BOOTSTRAP_SRC)/.built.bower.bootstrap: .got.bower.bootstrap
	cd $(BOOTSTRAP_SRC); pwd; npm install; grunt dist
	touch $(BOOTSTRAP_SRC)/.built.bower.bootstrap


$(BOOTSTRAP_SRC)/dist/bootstrap.min.css: $(BOOTSTRAP_SRC)/.built.bower.bootstrap

public/css/bootstrap.min.css: $(BOOTSTRAP_SRC)/dist/bootstrap.min.css
	cp $(BOOTSTRAP_SRC)/dist/bootstrap.min.css public/css/

$(BOOTSTRAP_SRC)/dist/bootstrap.min.js: $(BOOTSTRAP_SRC)/.built.bower.bootstrap

public/js/bootstrap.min.js: $(BOOTSTRAP_SRC)/dist/bootstrap.min.js
	cp $(BOOTSTRAP_SRC)/dist/bootstrap.min.js public/js/

bootstrap_resources: public/css/bootstrap.min.css public/js/bootstrap.min.js

clean_bootstrap:
	rm -f public/css/bootstrap.min.css
	rm -f public/js/bootstrap.min.js

clobber_bootstrap:
	rm -f .got.bower.bootstrap
	rm -rf $(BOOTSTRAP_SRC)


#
# ### angular ###
#

# TODO download angular with bower if need be
#      (no build step needed, thankfully)

public/js/angular.min.js:
	cp public/components/angular/angular.min.js public/js/

angular_resources: public/js/angular.min.js

clean_angular:
	rm -f public/js/angular.min.js
