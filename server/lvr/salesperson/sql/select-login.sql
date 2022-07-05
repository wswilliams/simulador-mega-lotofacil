 SELECT * FROM salesperson s
 LEFT JOIN group_permissions_users u ON s.group_permissions_users_id = u.group_permissions_users_id
 LEFT JOIN group_permissions g ON u.group_permissions_id = g.group_permissions_id
 WHERE %;