const path = require('path');
const fs = require('fs');
const expect = require('chai').expect;

const Resource = require('../lib/resource');
const app = {
  logger : {
    debug(info) {},
    info(info) {}
  }
};
const config = {
  injectCss: true,
  injectJs: true,
  injectHeadRegex: /(<\/head>)/i,
  injectBodyRegex: /(<\/body>)/i
};
describe('resource.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#resource manifest file test', () => {
    it('should manifest init test', () => {
      const conf = {
        ...config,
        manifest: path.join(__dirname, './manifest.json')
      };
      const resource = new Resource(app, conf);
      expect(!!resource.manifest.deps).to.equal(true);
      expect(resource.manifest.info.publicPath).to.equal('/public/');
    });
    it('should manifest init test', () => {
      const conf = {
        ...config,
        manifest: path.join(__dirname, './manifest.json')
      };
      const resource = new Resource(app, conf);
      expect(resource.manifest.deps['search.js'].js.length).to.equal(3);
      expect(resource.manifest.deps['search.js'].css.length).to.equal(1);
    });

    it('should html inject manifest', () => {
      const conf = {
        ...config,
        manifest: path.join(__dirname, './manifest.json'),
        afterRender(html, context) {
          return html;
        }
      };
      const resource = new Resource(app, conf);
      const layout = fs.readFileSync(path.join(__dirname, 'layout.html'), 'utf8');
      const html = resource.inject(layout, 'search.js');
      expect(html).to.contain('<script> window.__INITIAL_STATE__= {};</script>');
      expect(html).to.contain('<script type="text/javascript" src="/public/js/runtime.abe9d429.js">');
      expect(html).to.contain('<link rel="stylesheet" href="/public/css/search.abe9d478.css">');
    });

    it('should html injectRes for http test', () => {
      const conf = {
        ...config,
        doctype: '<!DOCTYPE html>',
        manifest: path.join(__dirname, './manifest.json'),
        injectRes: [{ url: 'http://test.com/test.js' }]
      };
      const resource = new Resource(app, conf);
      const layout = fs.readFileSync(path.join(__dirname, 'layout.html'), 'utf8');
      const html = resource.inject(layout, 'search.js');
      expect(html).to.contain('<!DOCTYPE html>');
      expect(html).to.contain('<script> window.__INITIAL_STATE__= {};</script>');
      expect(html).to.contain('<script type="text/javascript" src="http://test.com/test.js">');
    });

    it('should html injectRes for manifest url mapping test', () => {
      const conf = {
        ...config,
        manifest: path.join(__dirname, './manifest.json'),
        injectRes: [
          { url: 'test.js' },  // manifest url mapping
          { url: 'test-direct.js' }, // 直接插入 script 链接
          { url: path.join(__dirname, 'inline.js'), inline: true },  // script inline
          { url: path.join(__dirname, 'inline.css'), inline: true },  // css inline
          { url: 'test.css' }
        ]
      };
      const resource = new Resource(app, conf);
      const layout = fs.readFileSync(path.join(__dirname, 'layout.html'), 'utf8');
      const html = resource.inject(layout, 'search.js');
      expect(html).to.contain('<link rel="stylesheet" href="test.css">');
      expect(html).to.contain('<style>.test{ color: red }</style>');
      expect(html).to.contain('<script> window.__INITIAL_STATE__= {};</script>');
      expect(html).to.contain('<script>console.log(123456);</script>');
      expect(html).to.contain('<script type="text/javascript" src="test-direct.js">');
      expect(html).to.contain('<script type="text/javascript" src="/public/js/chunk/test.7cb3c087.js">');
    });
    it('should html injectRes for manifest url crossorigin test', () => {
      const conf = {
        ...config,
        crossorigin: true,
        manifest: path.join(__dirname, './manifest.json'),
      };
      const resource = new Resource(app, conf);
      const layout = fs.readFileSync(path.join(__dirname, 'layout.html'), 'utf8');
      const html = resource.inject(layout, 'search.js');
      expect(html).to.contain('<script> window.__INITIAL_STATE__= {};</script>');
      expect(html).to.contain('<script type="text/javascript" crossorigin="anonymous" src="/public/js/chunk/common.e525d392.js"></script>');
    });
    it('should html injectRes for manifest url crossorigin set test', () => {
      const conf = {
        ...config,
        crossorigin: 'use-credentials',
        manifest: path.join(__dirname, './manifest.json'),
      };
      const resource = new Resource(app, conf);
      const layout = fs.readFileSync(path.join(__dirname, 'layout.html'), 'utf8');
      const html = resource.inject(layout, 'search.js');
      expect(html).to.contain('<script> window.__INITIAL_STATE__= {};</script>');
      expect(html).to.contain('<script type="text/javascript" crossorigin="use-credentials" src="/public/js/chunk/common.e525d392.js"></script>');
    });
    it('should html injectRes for manifest json config test', () => {
      const conf = {
        ...config,
        manifest: require(path.join(__dirname, './manifest.json')),
        injectRes: [
          { url: 'test.js' },  // manifest url mapping
          { url: 'test-direct.js' }, // 直接插入 script 链接
          { url: path.join(__dirname, 'inline.js'), inline: true },  // script inline
          { url: path.join(__dirname, 'inline.css'), inline: true },  // css inline
          { url: 'test.css' }
        ]
      };
      const resource = new Resource(app, conf);
      const layout = fs.readFileSync(path.join(__dirname, 'layout.html'), 'utf8');
      const html = resource.inject(layout, 'search.js');
      expect(html).to.contain('<link rel="stylesheet" href="test.css">');
      expect(html).to.contain('<style>.test{ color: red }</style>');
      expect(html).to.contain('<script> window.__INITIAL_STATE__= {};</script>');
      expect(html).to.contain('<script>console.log(123456);</script>');
      expect(html).to.contain('<script type="text/javascript" src="test-direct.js">');
      expect(html).to.contain('<script type="text/javascript" src="/public/js/chunk/test.7cb3c087.js">');
    });
    it('should html inject res location head test', () => {
      const conf = {
        ...config,
        manifest: path.join(__dirname, './manifest.json'),
        injectRes: [
          { url: 'test-head-before.js', location: 'headBefore' },  // manifest url mapping
          { url: 'test-head-after.js', location: 'headAfter' },  // manifest url mapping
          { url: 'test-head-before.css', location: 'headBefore' },  // manifest url mapping
          { url: 'test-head-after.css', location: 'headAfter' },  // manifest url mapping
        ]
      };
      const resource = new Resource(app, conf);
      const layout = fs.readFileSync(path.join(__dirname, 'layout.html'), 'utf8');
      const html = resource.inject(layout, 'search.js');
      expect(html).to.contain('<link rel="stylesheet" href="test-head-before.css"><script type="text/javascript" src="test-head-before.js"></script>');
      expect(html).to.contain('<script type="text/javascript" src="test-head-after.js"></script><link rel="stylesheet" href="test-head-after.css">');
    });
    it('should html inject res location body test', () => {
      const conf = {
        ...config,
        manifest: path.join(__dirname, './manifest.json'),
        injectRes: [
          { url: 'test-head-before.js', location: 'bodyBefore' },  // manifest url mapping
          { url: 'test-head-after.js', location: 'bodyAfter' },  // manifest url mapping
        ]
      };
      const resource = new Resource(app, conf);
      const layout = fs.readFileSync(path.join(__dirname, 'layout.html'), 'utf8');
      const html = resource.inject(layout, 'search.js');
      expect(html).to.contain('<script type="text/javascript" src="test-head-before.js"></script><script> window.__INITIAL_STATE__= {};</script><script type="text/javascript" src="/public/js/runtime.abe9d429.js"></script>');
      expect(html).to.contain('<script type="text/javascript" src="/public/js/chunk/search.7cb3c087.js"></script><script type="text/javascript" src="test-head-after.js"></script>');
    });
  });
});
