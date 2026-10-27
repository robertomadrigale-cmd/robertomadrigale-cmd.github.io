// Static repository server used by the margin checker. Ctrl+C closes an owned server.
const {server}=require('../../bajo/tests/helpers.cjs');
server().then(s=>console.log(s?'Serving repository on http://localhost:8765':'Existing server on :8765')).catch(e=>{console.error(e);process.exitCode=1});
