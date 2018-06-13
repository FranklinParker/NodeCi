const Page = require('./helpers/Page1');

let page;
beforeEach(async () => {
  page = await  Page.build();
  await page.goto('http://localhost:3000');

});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {

  beforeEach(async () => {
    await  page.login();
    await page.click('a.btn-floating');
  });



  test('can see blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('using valid inputs', async ()=>{
    beforeEach(async ()=>{
      await page.type('.title input', 'My Title');
      await page.type('.content input', 'My Content');
      await page.click('form button');

    });

    test('takes to review screen', async ()=>{
      const headerMsg = await page.getContentsOf('h5');
      expect(headerMsg).toEqual('Please confirm your entries');

    });
    test('save adds to index screen', async ()=>{
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const contents = await page.getContentsOf('p');
      expect(title).toEqual('My Title');
      expect(contents).toEqual('My Content');

    });
  });
  describe('when using invalid inputs', async ()=>{
    beforeEach(async ()=>{
      await page.click('form button');

    });

    test('when using invalid inputs', async ()=>{
      const titleErr = await page.getContentsOf('.title .red-text');
      const contentErr = await page.getContentsOf('.content .red-text');

      expect(titleErr).toEqual('You must provide a value');
      expect(contentErr).toEqual('You must provide a value');

    });
  });
});

describe('When not logged in', async () => {


  test('Cannot create blog posts', async ()=>{
    const result = await page.evaluate(()=>{

      return fetch('api/blogs',{
        method: 'POST',
        credentials: 'same-origin',
        header: {
          'Content-Type': 'application-json'
        },
        body: JSON.stringify({ title: 'My Title',
          content: 'My Content' })
      }).then(res=> res.json());

    });
    expect(result.error).toEqual('You must log in!' );
  });

  test('Cannot get blog posts', async ()=>{
    const result = await page.evaluate(()=>{

      return fetch('api/blogs',{
        method: 'GET',
        credentials: 'same-origin',
        header: {
          'Content-Type': 'application-json'
        },

      }).then(res=> res.json());

    });
    expect(result.error).toEqual('You must log in!' );
  });

});