SELECT %
FROM salesperson s
INNER JOIN group_permissions_users u on u.group_permissions_users_id = s.group_permissions_users_id
INNER JOIN group_permissions g on g.group_permissions_id = u.group_permissions_id
LEFT JOIN company c on c.company_id = s.company_id
%;
