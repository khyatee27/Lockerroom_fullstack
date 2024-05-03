// admin can remove the user from same lobby
server.post('/api/lobbyid/removeuser', async (req, res) =>  {
    const {nickname}=req.body
  //check if admin is yes
    const q = await pool.query('SELECT admin from login where email=$1',[req.user.email]) 
    if (q.rowCount === 0) {
      return res.status(404).send({ error: 'Can not find messages.Check input' })
    }
      //if admin is yes then remove user for same lobyy
    console.log(req.user.email+"is an ADMIN")
  
  const admin_lobby=await pool.query('SELECT lobbyid from login where email=$1',[req.user.email])
  const admin_lobbyid=admin_lobby.rows[0].lobbyid
  const user_lobbyid= await pool.query('select lobbyid from login where nickname=$1',[nickname])
  const l=user_lobbyid.rows[0].lobbyid
  //logic to check if user has morethan one lobby_id for ex. 1,2 
  const lobby_array=l.split(",")
  let new_lobbyid="";
  let cnt=0;
  for (i=0;i<lobby_array.length;i++){
     
    if(admin_lobbyid!=lobby_array[i]) //if present lobbyid not equals lobbyid to delete then store it
    {
      //go through loop & store new lobby id after removing current lobby
      if(cnt==0){
        new_lobbyid=lobby_array[i]}
      
      else{
        new_lobbyid=new_lobbyid+","+lobby_array[i]}
       
       cnt++;  
    }
    
  }

  const q2 = await pool.query(`update login set lobbyid='${new_lobbyid}' where nickname=$1`,[nickname])

  if(q2.rowCount===0){
    return res.status(404).send({ error: 'Can not find User to remove.Check input' })
  }
  return res.send("User removed from lobbyno"+admin_lobbyid)
})